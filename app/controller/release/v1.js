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
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().trim().value
        const isSelf = ctx.checkQuery("isSelf").optional().default(0).toInt().in([0, 1]).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1]).value

        ctx.validate(Boolean(isSelf))

        const condition = {}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (isSelf) {
            condition.userId = ctx.request.userId
        }
        if (lodash.isInteger(status)) {
            condition.status = status
        }

        if (lodash.isString(keywords) && keywords.length > 0) {
            let searchRegExp = new RegExp(keywords, "i")
            if (/^[0-9a-fA-F]{4,24}$/.test(keywords)) {
                condition.$or = [{releaseName: searchRegExp}, {_id: keywords.toLowerCase()}]
            } else {
                condition.releaseName = searchRegExp
            }
        }

        var dataList = []
        const totalItem = await this.releaseProvider.count(condition)
        if (totalItem <= (page - 1) * pageSize) {
            return ctx.success({page, pageSize, totalItem, dataList})
        }

        dataList = await this.releaseProvider.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})

        const resourceIds = {resourceId: {$in: dataList.map(x => x.latestVersion.resourceId)}}
        const resourceMap = await this.resourceProvider.find(resourceIds)
            .then(list => new Map(list.map(x => [x.resourceId, x])))

        dataList = dataList.map(release => {
            release = release.toObject()
            release.latestVersion.resourceInfo = resourceMap.get(release.latestVersion.resourceId)
            return release
        })

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

        await this.releaseProvider.find(condition, projection.join(' ')).then(ctx.success)
    }

    /**
     * 创建发行
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const resourceId = ctx.checkBody('resourceId').exist().isResourceId().value
        const releaseName = ctx.checkBody('releaseName').exist().isReleaseName().value
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

        const {username = null} = ctx.request.identityInfo.userInfo
        if (username === null) {
            throw new ApplicationError(ctx.gettext('用户名缺失,请补充账户信息'))
        }

        await this._checkReleaseName(username, releaseName)
        const resourceInfo = await this.resourceProvider.findOne({resourceId}).tap(resourceInfo => ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId')
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
        const policyInfo = ctx.checkBody('policyInfo').optional().isObject().value
        const intro = ctx.checkBody('intro').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value

        ctx.validate(true)

        if ([policyInfo, intro, previewImages].every(x => x === undefined)) {
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
            msg: ctx.gettext('params-validate-failed', 'releaseId')
        }))

        // if (releaseName !== undefined && releaseInfo.releaseName !== releaseName) {
        //     await this._checkReleaseName(releaseName)
        // }

        await ctx.service.releaseService.updateReleaseInfo({
            releaseInfo, intro, previewImages, policyInfo
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

        const {resourceId = ''} = version ? releaseInfo.resourceVersions.find(x => x.version === version) || {} : releaseInfo.latestVersion
        if (!resourceId) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'version'))
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
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default(['versionRange', 'baseUpcastReleases']).value
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const resourceVersion = this._getReleaseVersion(releaseInfo, version)

        await ctx.service.releaseService.releaseDependencyTree(releaseInfo, resourceVersion, isContainRootNode, maxDeep, omitFields).then(ctx.success)
    }

    /**
     * 获取发行的授权树
     * @param ctx
     * @returns {Promise<void>}
     */
    async releaseAuthTree(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const resourceVersion = this._getReleaseVersion(releaseInfo, version)

        await ctx.service.releaseService.releaseAuthTree(releaseInfo, resourceVersion).then(ctx.success)
    }


    /**
     * 获取发行的上抛树
     * @param ctx
     * @returns {Promise<void>}
     */
    async releaseUpcastTree(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value
        ctx.validate()

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const resourceVersion = this._getReleaseVersion(releaseInfo, version)

        await ctx.service.releaseService.releaseUpcastTree(releaseInfo, resourceVersion, maxDeep).then(ctx.success)
    }

    /**
     * 发行详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async detail(ctx) {

        const releaseName = ctx.checkQuery('releaseName').exist().isFullReleaseName().value
        ctx.validate(false)

        const condition = {
            releaseName: new RegExp(`^${releaseName}$`, "i")
        }

        await this.releaseProvider.findOne(condition).then(ctx.success)
    }

    /**
     * 根据发行ID和版本范围查询最佳匹配的具体版本号
     * @param ctx
     * @returns {Promise<void>}
     */
    async maxSatisfyingVersion(ctx) {

        const releaseIds = ctx.checkQuery('releaseIds').exist().isSplitMongoObjectId().toSplitArray().len(1).value
        const versionRanges = ctx.checkQuery('versionRanges').exist().toSplitArray().len(1).value
        ctx.validate()

        if (releaseIds.length !== versionRanges.length) {
            throw new ArgumentError(ctx.gettext('params-comb-validate-failed', 'releaseIds,versionRanges'))
        }
        if (versionRanges.some(x => !semver.validRange(x))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'versionRanges'))
        }

        const releaseMap = await this.releaseProvider.find({_id: {$in: releaseIds}}, 'resourceVersions')
            .then(list => new Map(list.map(x => [x.releaseId, x.resourceVersions])))

        if (releaseMap.size !== lodash.uniq(releaseIds).length) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'releaseIds'))
        }

        const results = releaseIds.map((releaseId, index) => {
            let versionRange = versionRanges[index]
            let resourceVersions = releaseMap.get(releaseId).map(x => x.version)
            return {
                releaseId, version: semver.maxSatisfying(resourceVersions, versionRange)
            }
        })

        ctx.success(results)
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
    async _checkReleaseName(username, releaseName) {

        if (releaseName === undefined || releaseName === null) {
            return true
        }

        const {ctx} = this
        const checkReleaseNameCondition = {
            userId: ctx.request.userId,
            releaseName: new RegExp(`^${username}/${releaseName}$`, "i")
        }

        await this.releaseProvider.findOne(checkReleaseNameCondition, 'releaseName').then(name => {
            if (name) {
                throw new ApplicationError(ctx.gettext('release-name-is-exist-validate-failed'))
            }
        })

        return true
    }

    /**
     * 获取资源版本版本
     * @param releaseInfo
     * @param version
     * @returns {}
     * @private
     */
    _getReleaseVersion(releaseInfo, version) {

        if (version && !releaseInfo.resourceVersions.some(x => x.version === version)) {
            throw new ArgumentError(this.ctx.gettext('params-validate-failed', 'version'))
        }

        return version ? releaseInfo.resourceVersions.find(x => x.version === version) : releaseInfo.latestVersion
    }
}