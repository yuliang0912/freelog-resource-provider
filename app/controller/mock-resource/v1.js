'use strict'

const aliOss = require('ali-oss')
const lodash = require('lodash')
const Controller = require('egg').Controller
const {ArgumentError} = require('egg-freelog-base/error')
const ResourceInfoValidator = require('../../extend/json-schema/resource-info-validator')
const {LoginUser, InternalClient} = require('egg-freelog-base/app/enum/identity-type')

module.exports = class MockResourceController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.client = new aliOss(app.config.uploadConfig.aliOss)
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * mock资源列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery("page").optional().default(1).gt(0).toInt().value
        const pageSize = ctx.checkQuery("pageSize").optional().default(10).gt(0).lt(101).toInt().value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().value
        const bucketName = ctx.checkQuery("bucketName").optional().isBucketName().value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        const condition = {userId: ctx.request.userId}
        if (bucketName !== undefined) {
            condition.bucketName = bucketName
        }
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (keywords) {
            condition.$or = [{name: {$regex: keywords, $options: 'i'}}, {bucketName: {$regex: keywords, $options: 'i'}}]
        }

        var dataList = []
        const totalItem = await this.mockResourceProvider.count(condition)
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.mockResourceProvider.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})
        }

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 详情
     * @param ctx
     */
    async show(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        await this.mockResourceProvider.findById(mockId).then(ctx.success)
    }

    /**
     * 详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async detail(ctx) {

        const mockName = ctx.checkQuery('mockName').exist().len(3).value
        ctx.validateParams().validateVisitorIdentity(LoginUser | InternalClient)

        const splitStrIndex = mockName.indexOf('/')
        if (splitStrIndex < 0) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'mockName'))
        }

        const bucketName = mockName.substr(0, splitStrIndex)
        const name = mockName.substr(splitStrIndex + 1)

        await this.mockResourceProvider.findOne({bucketName, name}).then(ctx.success)
    }


    /**
     * 创建草稿资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const bucketName = ctx.checkBody('bucketName').exist().isBucketName().trim().value
        const name = ctx.checkBody('name').exist().type('string').isReleaseName().value
        const uploadFileId = ctx.checkBody('uploadFileId').exist().isMongoObjectId().value
        const meta = ctx.checkBody('meta').optional().default({}).isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 10).default([]).value
        const dependencyInfo = ctx.checkBody('dependencyInfo').optional().isObject().default({}).value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        if (previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const mockDependencyValidateResult = new ResourceInfoValidator().mockResourceDependencyValidate(dependencyInfo)
        if (mockDependencyValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencyInfo'), {errors: mockDependencyValidateResult.errors})
        }

        const bucketInfoTask = this.mockResourceBucketProvider.findOne({bucketName}).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'bucketName')
        }))
        const uploadFileInfoTask = this.temporaryUploadFileProvider.findById(uploadFileId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'uploadFileId')
        }))

        const [bucketInfo, uploadFileInfo] = await Promise.all([bucketInfoTask, uploadFileInfoTask])

        await ctx.service.mockResourceService.createMockResource({
            name, uploadFileInfo, bucketInfo, meta, description, previewImages, dependencyInfo
        }).then(ctx.success)
    }


    /**
     * mock转资源
     * @returns {Promise<void>}
     */
    async convertToResource(ctx) {

        const mockId = ctx.checkParams('mockId').exist().isMongoObjectId().value
        const resourceAliasName = ctx.checkBody('resourceAliasName').exist().len(1, 100).trim().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('mock-resource-entity-not-found')
        }))

        await ctx.service.mockResourceService.convertToResource(mockResourceInfo, resourceAliasName).then(ctx.success)
    }

    /**
     * 更新mock资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async update(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        const meta = ctx.checkBody('meta').optional().isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 10).value
        const dependencyInfo = ctx.checkBody('dependencyInfo').optional().isObject().value
        const uploadFileId = ctx.checkBody('uploadFileId').optional().isMongoObjectId(ctx.gettext('params-format-validate-failed', 'uploadFileId')).value
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        if ([meta, description, uploadFileId, previewImages, dependencyInfo, resourceType].every(x => x === undefined)) {
            ctx.error({msg: ctx.gettext('params-required-validate-failed')})
        }
        if (previewImages && previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const mockDependencyValidateResult = new ResourceInfoValidator().mockResourceDependencyValidate(dependencyInfo)
        if (dependencyInfo && mockDependencyValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencyInfo'), {errors: mockDependencyValidateResult.errors})
        }

        let uploadFileInfo = null
        if (uploadFileId) {
            uploadFileInfo = await this.temporaryUploadFileProvider.findById(uploadFileId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
                msg: ctx.gettext('params-validate-failed', 'uploadFileId')
            }))
        }

        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('mock-resource-entity-not-found')
        }))

        await ctx.service.mockResourceService.updateMockResource({
            mockResourceInfo, uploadFileInfo, meta, description, previewImages, dependencyInfo, resourceType
        }).then(ctx.success)
    }


    /**
     * 删除mock资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'mockId'),
            data: {mockId}
        }))

        await ctx.service.mockResourceService.deleteMockResource(mockResourceInfo).then(ctx.success)
    }


    /**
     * mock-name是否在当前bucket已经存在
     * @param ctx
     * @returns {Promise<void>}
     */
    async isExistMockName(ctx) {

        const name = ctx.checkQuery('name').exist().value
        const bucketName = ctx.checkQuery('bucketName').exist().isBucketName().value
        ctx.validateParams()

        await this.mockResourceProvider.findOne({name, bucketName}, '_id').then(data => ctx.success(Boolean(data)))
    }

    /**
     * 下载资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async download(ctx) {

        const mockResourceId = ctx.checkParams('mockResourceId').exist().isMongoObjectId().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        const mockResourceInfo = await this.mockResourceProvider.findById(mockResourceId).tap(mockResourceInfo => ctx.entityNullValueAndUserAuthorizationCheck(mockResourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'mockResourceId')
        }))

        const {fileOss, systemMeta, name} = mockResourceInfo
        await this.client.getStream(fileOss.objectKey).then(result => {
            ctx.status = result.res.status
            ctx.attachment(fileOss.filename || name)
            ctx.set('content-type', systemMeta.mimeType)
            ctx.body = result.stream
        })
    }

    /**
     * 获取一个发行的依赖树
     * @param ctx
     * @returns {Promise<void>}
     */
    async dependencyTree(ctx) {

        const mockResourceId = ctx.checkParams('mockResourceId').exist().isMongoObjectId().value
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value
        ctx.validateParams().validateVisitorIdentity(LoginUser | InternalClient)

        const mockResourceInfo = await this.mockResourceProvider.findById(mockResourceId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'mockResourceId')
        }))

        await ctx.service.mockResourceService.mockDependencyTree(mockResourceInfo, isContainRootNode).then(ctx.success)
    }

    /**
     * 获取资源加密过的下载URL地址
     * @returns {Promise<void>}
     */
    async signedMockResourceInfo(ctx) {

        const mockResourceId = ctx.checkParams('mockResourceId').isMongoObjectId().value
        ctx.validateParams().validateVisitorIdentity(LoginUser | InternalClient)

        const mockResourceInfo = await this.mockResourceProvider.findById(mockResourceId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'mockResourceId')
        }))

        const {fileOss, systemMeta} = mockResourceInfo
        const response = {expires: 60, 'response-content-type': systemMeta.mimeType}

        const resourceFileUrl = this.client.signatureUrl(fileOss.objectKey, response)

        ctx.success(Object.assign(lodash.pick(mockResourceInfo, ['name', 'bucketName', 'previewImages', 'resourceType', 'systemMeta', 'meta']), {resourceFileUrl}))
    }
}