'use strict'

const lodash = require('lodash')
const aliOss = require('ali-oss')
const Controller = require('egg').Controller
const {ArgumentError, AuthorizationError, AuthenticationError} = require('egg-freelog-base/error')
const ResourceInfoValidator = require('../../extend/json-schema/resource-info-validator')

module.exports = class ResourcesController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
        this.client = new aliOss(app.config.uploadConfig.aliOss)
    }

    /**
     * 资源列表展示
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery('page').optional().gt(0).toInt().default(1).value
        const pageSize = ctx.checkQuery('pageSize').optional().gt(0).lt(101).toInt().default(10).value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().value
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().trim().value
        const isSelf = ctx.checkQuery("isSelf").optional().default(0).toInt().in([0, 1]).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value

        ctx.validate(Boolean(isSelf))

        const condition = {}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (lodash.isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, "i")
            if (/^[0-9a-zA-Z]{4,40}$/.test(keywords)) {
                condition.$or = [{resourceId: searchRegExp}, {aliasName: searchRegExp}]
            } else {
                condition.aliasName = searchRegExp
            }
        }
        if (isSelf) {
            condition.userId = ctx.request.userId
        }

        var dataList = []
        const totalItem = await this.resourceProvider.count(condition)
        if (totalItem > (page - 1) * pageSize) { //避免不必要的分页查询
            dataList = await this.resourceProvider.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})
        }

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 获取资源列表
     * @returns {Promise.<void>}
     */
    async list(ctx) {

        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 1000).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value

        ctx.validate(false)

        await this.resourceProvider.find({resourceId: {$in: resourceIds}}, projection.join(' ')).then(ctx.success)
    }

    /**
     * 查询资源详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async show(ctx) {

        const resourceId = ctx.checkParams('id').exist().isResourceId().value
        ctx.validate()

        await this.resourceProvider.findOne({resourceId}).then(ctx.success)
    }

    /**
     * 创建资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const aliasName = ctx.checkBody('aliasName').exist().len(1, 100).trim().value
        const meta = ctx.checkBody('meta').optional().default({}).isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).default([]).value
        const uploadFileId = ctx.checkBody('uploadFileId').exist().isMongoObjectId().value
        ctx.validate()

        const dependReleasesValidateResult = new ResourceInfoValidator().resourceDependencyValidate(dependencies)
        if (dependReleasesValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {errors: dependReleasesValidateResult.errors})
        }
        if (previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const uploadFileInfo = await this.temporaryUploadFileProvider.findById(uploadFileId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'uploadFileId'),
            data: {uploadFileId}
        }))

        await ctx.service.resourceService.createResource({
            uploadFileInfo, aliasName, meta, description, previewImages, dependencies
        }).then(ctx.success)
    }

    /**
     * 更新资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async update(ctx) {

        const resourceId = ctx.checkParams('id').exist().isResourceId().value
        const aliasName = ctx.checkBody('aliasName').optional().len(1, 100).trim().value
        const meta = ctx.checkBody('meta').optional().isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).value
        ctx.validate()

        if (dependencies) {
            const dependReleasesValidateResult = new ResourceInfoValidator().resourceDependencyValidate(dependencies)
            if (dependReleasesValidateResult.errors.length) {
                throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {errors: dependReleasesValidateResult.errors})
            }
            await this.releaseProvider.findOne({'resourceVersions.resourceId': resourceId}, '_id').then(data => {
                if (data) {
                    throw new ArgumentError(ctx.gettext('resource-depend-release-update-refuse'), {dependencies})
                }
            })
        }
        if (previewImages && previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const resourceInfo = await this.resourceProvider.findOne({resourceId}).tap(resourceInfo => ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'),
            data: {resourceId}
        }))

        await ctx.service.resourceService.updateResourceInfo({
            resourceInfo, aliasName, meta, description, previewImages, dependencies
        }).then(ctx.success)
    }

    /**
     * 资源所挂载的发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async releases(ctx) {

        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default(['releaseId', 'releaseName', 'username']).value
        ctx.validate()

        const results = []
        const releases = await this.releaseProvider.find({'resourceVersions.resourceId': resourceId})

        for (let i = 0, j = releases.length; i < j; i++) {
            let releaseInfo = releases[i]
            results.push(Object.assign(lodash.pick(releaseInfo, projection), {
                resourceVersion: releaseInfo.resourceVersions.find(x => x.resourceId === resourceId)
            }))
        }

        ctx.success(results)
    }

    /**
     * 批量查询资源所挂载的发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async batchReleases(ctx) {

        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default(['releaseId', 'releaseName', 'username', 'version']).value
        ctx.validate()

        const releases = await this.releaseProvider.find({'resourceVersions.resourceId': {$in: resourceIds}})

        const results = resourceIds.map(resourceId => Object({
            resourceId,
            releases: releases.filter(x => x.resourceVersions.some(m => m.resourceId === resourceId)).map(release => {
                let releaseInfo = lodash.pick(release, projection)
                if (projection.includes('version')) {
                    releaseInfo.version = release.resourceVersions.find(n => n.resourceId === resourceId).version
                }
                return releaseInfo
            })
        }))

        ctx.success(results)
    }

    /**
     * 下载资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async download(ctx) {

        const resourceId = ctx.checkParams('resourceId').isResourceId().value
        ctx.validate()

        const {userId, clientId} = ctx.request
        const resourceInfo = await this.resourceProvider.findOne({resourceId}).tap(resourceInfo => ctx.entityNullObjectCheck(resourceInfo))

        if (!clientId && !userId) {
            throw new AuthenticationError(ctx.gettext('user-authentication-failed'))
        }
        if (!clientId && userId && resourceInfo.userId !== userId) {
            throw new AuthorizationError(ctx.gettext('user-authorization-failed'))
        }

        const {fileOss, systemMeta, aliasName} = resourceInfo

        await this.client.getStream(fileOss.objectKey).then(result => {
            ctx.status = result.res.status
            ctx.attachment(fileOss.filename || aliasName)
            ctx.set('content-length', result.res.headers['content-length'])
            ctx.set('content-type', systemMeta.mimeType)
            ctx.body = result.stream
        })
    }

    /**
     * 获取资源加密过的下载URL地址
     * @returns {Promise<void>}
     */
    async signedResourceInfo(ctx) {

        const resourceId = ctx.checkParams('resourceId').isResourceId().value
        ctx.validate()

        const resourceInfo = await this.resourceProvider.findOne({resourceId}).tap(resourceInfo => ctx.entityNullObjectCheck(resourceInfo))

        const {fileOss, systemMeta} = resourceInfo
        const response = {expires: 60, 'response-content-type': systemMeta.mimeType}

        const resourceFileUrl = this.client.signatureUrl(fileOss.objectKey, response)

        ctx.success(Object.assign(lodash.pick(resourceInfo, ['resourceId', 'aliasName', 'previewImages', 'resourceType', 'systemMeta', 'meta']), {resourceFileUrl}))
    }
}