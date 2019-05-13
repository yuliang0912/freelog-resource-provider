'use strict'

const lodash = require('lodash')
const semver = require('semver')
const Controller = require('egg').Controller
const {ApplicationError, ArgumentError} = require('egg-freelog-base/error')
const ReleasePolicyValidator = require('../../extend/json-schema/release-policy-validator')
const SchemeResolveAndUpcastValidator = require('../../extend/json-schema/scheme-resolve-upcast-validator')

module.exports = class ReleaseController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.releaseSchemeProvider = app.dal.releaseSchemeProvider
    }

    /**
     * 资源分页列表
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery("page").optional().default(1).gt(0).toInt().value
        const pageSize = ctx.checkQuery("pageSize").optional().default(10).gt(0).lt(101).toInt().value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().value
        const isSelf = ctx.checkQuery("isSelf").optional().default(0).toInt().in([0, 1]).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value

        ctx.validate(Boolean(isSelf))

        const condition = {status: 1}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (keywords !== undefined) {
            condition.releaseName = new RegExp(keywords, "i")
        }
        if (isSelf) {
            condition.userId = ctx.request.userId
        }

        var dataList = []
        const totalItem = await this.releaseProvider.count(condition)
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.releaseProvider.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})
        }

        if (dataList.length && dataList[0].latestVersion) {
            const condition = {resourceId: {$in: dataList.map(x => x.latestVersion.resourceId)}}
            const resourceMap = await this.resourceProvider.find(condition)
                .then(list => new Map(list.map(x => [x.resourceId, x])))

            dataList = dataList.map(release => {
                release = release.toObject()
                release.latestVersion.resourceInfo = resourceMap.get(release.latestVersion.resourceId)
                return release
            })
        }

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 批量查询发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async list(ctx) {

        const releaseIds = ctx.checkQuery('releaseIds').optional().isSplitMongoObjectId().toSplitArray().value
        const releaseNames = ctx.checkQuery('releaseNames').optional().toSplitArray().value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value
        ctx.validate()

        var condition = {}
        if (!lodash.isEmpty(releaseIds)) {
            condition._id = {$in: releaseIds}
        }
        if (!lodash.isEmpty(releaseNames)) {
            condition.releaseName = {$in: releaseNames}
        }
        if (lodash.isEmpty(condition)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'))
        }
        condition.status = 1

        await this.releaseProvider.find(condition, projection.join(' ')).then(ctx.success)
    }

    /**
     * 创建发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const resourceId = ctx.checkBody('resourceId').exist().isResourceId().value
        const releaseName = ctx.checkBody('releaseName').exist().type('string').trim().len(1, 100).value
        const resolveReleases = ctx.checkBody('resolveReleases').exist().isArray().value
        //第一次创建发行方案上抛范围设置为发行的基础上抛
        const baseUpcastReleases = ctx.checkBody('baseUpcastReleases').exist().isArray().value
        const version = ctx.checkBody('version').optional().default('0.1.0').is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value
        const intro = ctx.checkBody('intro').optional().type('string').default('').len(0, 500).value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        ctx.validate()

        this._validateUpcastAndResolveReleasesParamFormat(baseUpcastReleases, resolveReleases)

        const policiesValidateResult = new ReleasePolicyValidator().createReleasePoliciesValidate(policies)
        if (policiesValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {policiesValidateResult})
        }

        if (previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        await this._checkReleaseName(releaseName)
        const resourceInfo = await this.resourceProvider.findOne({resourceId}).tap(resourceInfo => ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'),
            data: {resourceId}
        }))

        await ctx.service.releaseService.createRelease({
            resourceInfo, releaseName, intro, previewImages,
            policies, baseUpcastReleases, resolveReleases,
            version: semver.clean(version)
        }).then(ctx.success)
    }

    /**
     * 更新发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async update(ctx) {

        const releaseId = ctx.checkParams('id').isMongoObjectId().value
        const releaseName = ctx.checkBody('releaseName').optional().type('string').trim().len(1, 100).value
        const policyInfo = ctx.checkBody('policyInfo').optional().isObject().value
        const intro = ctx.checkBody('intro').optional().type('string').default('').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value

        ctx.validate(true)

        if ([releaseName, policyInfo, intro, previewImages].every(x => x === undefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'))
        }

        if (previewImages && previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const policyValidateResult = new ReleasePolicyValidator().updateReleasePoliciesValidate(policyInfo)
        if (policyInfo && policyValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {errors: policyValidateResult.errors})
        }

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        if (releaseName !== undefined && releaseInfo.releaseName !== releaseName) {
            await this._checkReleaseName(releaseName)
        }

        await ctx.service.releaseService.updateReleaseInfo({
            releaseInfo, releaseName, intro, previewImages, policyInfo
        }).then(ctx.success)
    }

    /**
     * 发行详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async show(ctx) {

        const releaseId = ctx.checkParams('id').exist().isMongoObjectId().value
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        ctx.validate(false)

        var releaseInfo = await this.releaseProvider.findById(releaseId)

        if (!releaseInfo) {
            return ctx.success(null)
        }

        var resourceId = releaseInfo.latestVersion.resourceId
        if (version) {
            const resourceVersion = releaseInfo.resourceVersions.find(x => x.version === version)
            if (!resourceVersion) {
                throw new ArgumentError(ctx.gettext('params-validate-failed', 'version'))
            }
            resourceId = resourceVersion.resourceId
        }

        releaseInfo = releaseInfo.toObject()
        releaseInfo.resourceInfo = await this.resourceProvider.findOne({resourceId})

        ctx.success(releaseInfo)
    }

    /**
     * 获取一个发行的依赖树
     * @param ctx
     * @returns {Promise<void>}
     */
    async dependencyTree(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const fields = ['releaseName', 'version']

        await ctx.service.releaseService.releaseDependencyTree(releaseInfo, versionRange, maxDeep, fields).then(ctx.success)
    }

    /**
     * 获取发行的授权树
     * @param ctx
     * @returns {Promise<void>}
     */
    async releaseAuthTree(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        await ctx.service.releaseService.releaseAuthTree(releaseInfo, versionRange).then(ctx.success)
    }


    /**
     * 获取发行的上抛树
     * @param ctx
     * @returns {Promise<void>}
     */
    async releaseUpcastTree(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        await ctx.service.releaseService.releaseUpcastTree(releaseInfo, versionRange, maxDeep).then(ctx.success)
    }

    /**
     * 发行详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async detail(ctx) {

        const fullReleaseName = ctx.checkQuery('fullReleaseName').exist().type('string').match(/^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+\//).value
        ctx.validate(false)

        const index = fullReleaseName.indexOf('/')
        const username = fullReleaseName.substr(0, index)
        const releaseName = fullReleaseName.substr(index + 1)

        const condition = {
            username: new RegExp(`^${username}$`, "i"), releaseName: new RegExp(`^${releaseName}$`, "i")
        }

        await this.releaseProvider.findOne(condition).then(ctx.success)
    }

    /**
     * 批量签约
     * @param ctx
     * @returns {Promise<void>}
     */
    async batchSignReleaseContracts(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const resourceVersion = releaseInfo.resourceVersions.find(x => x.version === version)
        if (!resourceVersion) {
            throw new ArgumentError('params-validate-failed', 'version')
        }

        const releaseScheme = await this.releaseSchemeProvider.findOne({
            releaseId, resourceId: resourceVersion.resourceId
        })

        await ctx.service.releaseService.batchSignReleaseContracts(releaseInfo.releaseId, releaseScheme.resolveReleases).then(ctx.success)
    }

    /**
     * 校验上抛和处理的数据格式
     * @param upcastReleases
     * @param resolveReleases
     * @private
     */
    _validateUpcastAndResolveReleasesParamFormat(upcastReleases, resolveReleases) {

        const {ctx} = this
        const schemeResolveAndUpcastValidator = new SchemeResolveAndUpcastValidator()
        const upcastReleasesValidateResult = schemeResolveAndUpcastValidator.upcastReleasesValidate(upcastReleases)
        if (upcastReleasesValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastReleases'), {
                errors: upcastReleasesValidateResult.errors
            })
        }

        const resolveReleasesValidateResult = schemeResolveAndUpcastValidator.resolveReleasesValidate(resolveReleases)
        if (resolveReleasesValidateResult.errors.length) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveReleases'), {
                errors: resolveReleasesValidateResult.errors
            })
        }
    }

    /**
     * 检查发行名
     * @param releaseName
     * @returns {Promise<boolean>}
     * @private
     */
    async _checkReleaseName(releaseName) {

        if (releaseName === undefined || releaseName === null) {
            return true
        }

        const {ctx} = this
        const checkReleaseNameCondition = {
            userId: ctx.request.userId,
            releaseName: new RegExp(`^${releaseName}$`, "i")
        }

        await this.releaseProvider.findOne(checkReleaseNameCondition, 'releaseName').then(name => {
            if (name) {
                throw new ApplicationError(ctx.gettext('release-name-is-exist-validate-failed'))
            }
        })

        return true
    }
}