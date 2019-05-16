'use strict'

const lodash = require('lodash')
const semver = require('semver')
const Controller = require('egg').Controller
const {ArgumentError, ApplicationError} = require('egg-freelog-base/error')
const SchemeResolveAndUpcastValidator = require('../../extend/json-schema/scheme-resolve-upcast-validator')

module.exports = class ReleaseAuthSchemeController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.releaseSchemeProvider = app.dal.releaseSchemeProvider
        this.resourceAuthPlanProvider = app.dal.resourceAuthPlanProvider
    }

    /**
     * 创建发行方案
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const resourceId = ctx.checkBody('resourceId').exist().isResourceId().value
        const resolveReleases = ctx.checkBody('resolveReleases').exist().isArray().value
        const version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        ctx.validate()

        this._validateUpcastAndResolveReleasesParamFormat([], resolveReleases)

        const resourceInfoTask = this.resourceProvider.findOne({resourceId}).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'),
            data: {resourceId}
        }))
        const releaseInfoTask = this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        const [resourceInfo, releaseInfo] = await Promise.all([resourceInfoTask, releaseInfoTask])
        if (releaseInfo.resourceVersions.some(x => x.resourceId === resourceId)) {
            throw new ArgumentError(ctx.gettext('release-resource-deny-repetition-error'))
        }
        if (!semver.gt(version, releaseInfo.latestVersion.version)) {
            throw new ArgumentError(ctx.gettext('resource-version-must-be-greater-than-latest-version', releaseInfo.latestVersion.version))
        }
        if (resourceInfo.resourceType !== releaseInfo.resourceType) {
            throw new ArgumentError(ctx.gettext('release-resource-type-validate-failed'))
        }

        await this.ctx.service.releaseSchemeService.createReleaseScheme({
            releaseInfo, resourceInfo, resolveReleases, version: semver.clean(version)
        }).then(ctx.success)
    }

    /**
     * 更新发行的具体版本的方案
     * @param ctx
     * @returns {Promise<void>}
     */
    async update(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const version = ctx.checkParams('id').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        const resolveReleases = ctx.checkBody('resolveReleases').exist().isArray().value
        ctx.validate()

        this._validateUpcastAndResolveReleasesParamFormat([], resolveReleases)

        const releaseInfo = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        if (!releaseInfo.resourceVersions.some(x => x.version === version)) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'version'))
        }

        await this.ctx.service.releaseSchemeService.updateReleaseScheme({
            releaseInfo, version, resolveReleases
        }).then(ctx.success)
    }

    /**
     * 方案详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async show(ctx) {

        const releaseId = ctx.checkParams('releaseId').exist().isMongoObjectId().value
        const version = ctx.checkParams('id').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value
        ctx.validate()

        await this.releaseSchemeProvider.findOne({releaseId, version: semver.clean(version)}).then(ctx.success)
    }


    /**
     * 方案详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async detail(ctx) {

        const releaseId = ctx.checkQuery('releaseId').exist().isMongoObjectId().value
        const resourceId = ctx.checkQuery('resourceId').exist().isResourceId().value
        ctx.validate()

        await this.releaseSchemeProvider.findOne({releaseId, resourceId}).then(ctx.success)
    }


    /**
     * 方案列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async list(ctx) {

        const releaseIds = ctx.checkQuery('releaseIds').exist().isSplitMongoObjectId().toSplitArray().len(1).value
        const versions = ctx.checkQuery('versions').optional().toSplitArray().len(1).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value
        ctx.validate()

        const condition = {}
        if (versions && versions.length !== releaseIds.length) {
            throw new ArgumentError(ctx.gettext('params-comb-validate-failed'))
        } else if (versions) {
            condition.$or = []
            for (let i = 0, j = releaseIds.length; i < j; i++) {
                condition.$or.push({releaseId: releaseIds[i], version: versions[i]})
            }
        } else {
            condition.releaseId = {$in: releaseIds}
        }

        await this.releaseSchemeProvider.find(condition, projection.join(' ')).then(ctx.success)
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
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'upcastReleases'), {
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
}