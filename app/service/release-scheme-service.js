'use strict'

const semver = require('semver')
const lodash = require('lodash')
const Service = require('egg').Service
const {ApplicationError, AuthorizationError} = require('egg-freelog-base/error')
const {createReleaseSchemeEvent} = require('../enum/resource-events')
const cryptoHelper = require('egg-freelog-base/app/extend/helper/crypto_helper')

module.exports = class ReleaseSchemeService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.releaseSchemeProvider = app.dal.releaseSchemeProvider
        this.resourceAuthPlanProvider = app.dal.resourceAuthPlanProvider
    }

    /*** 创建发行方案(非第一次)
     * @param releaseInfo
     * @param resourceInfo
     * @param resolveReleases
     * @param version
     * @returns {Promise<model>}
     */
    async createReleaseScheme({releaseInfo, resourceInfo, resolveReleases, version}) {

        const {ctx, userId, app} = this
        const {resourceId, systemMeta} = resourceInfo
        const {releaseId, baseUpcastReleases} = releaseInfo

        const cycleDependCheckResult = await this.cycleDependCheck(releaseId, systemMeta.dependencies)
        if (cycleDependCheckResult.ret) {
            throw new ApplicationError(ctx.gettext('release-circular-dependency-error'), {
                releaseId, deep: cycleDependCheckResult.deep
            })
        }

        //处理的依赖和上抛基本参数数据校验
        const {upcastReleases} = await this.validateUpcastAndResolveReleaseParams(systemMeta.dependencies, resolveReleases, baseUpcastReleases)

        //待签约的策略身份授权和签约授权校验
        await this.validatePolicyIdentityAndSignAuth(resolveReleases, true)

        const model = {
            schemeId: this.generateSchemeId(releaseId, version),
            releaseId, resourceId, upcastReleases, resolveReleases, userId, version
        }

        const releaseScheme = await this.releaseSchemeProvider.create(model)

        this.resourceProvider.updateOne({resourceId}, {isReleased: 1})

        app.emit(createReleaseSchemeEvent, releaseInfo, releaseScheme)

        return ctx.service.releaseService.batchSignAndBindReleaseSchemeContracts(releaseScheme).catch(error => {
            console.error('创建发行批量签约异常:', error)
            releaseScheme.updateOne({contractStatus: -1}).exec()
        })
    }

    /**
     * 更新发行方案
     * @param releaseInfo
     * @param version
     * @param resolveReleases 可以只传递修改的部分
     * @returns {Promise<void>}
     */
    async updateReleaseScheme({releaseInfo, version, resolveReleases}) {

        const {ctx} = this
        const schemeId = this.generateSchemeId(releaseInfo.releaseId, version)
        const releaseScheme = await this.releaseSchemeProvider.findOne({schemeId})

        const invalidResolveReleases = lodash.differenceBy(resolveReleases, releaseScheme.resolveReleases, x => x.releaseId)
        if (invalidResolveReleases.length) {
            throw new ApplicationError(ctx.gettext('release-scheme-update-resolve-release-invalid-error'), {invalidResolveReleases})
        }

        const beSignedContractReleases = []
        const updatedResolveReleases = releaseScheme.toObject().resolveReleases
        for (let i = 0, j = resolveReleases.length; i < j; i++) {
            let {releaseId, contracts} = resolveReleases[i]
            let intrinsicResolve = updatedResolveReleases.find(x => x.releaseId === releaseId)
            if (!intrinsicResolve) {
                continue
            }
            intrinsicResolve.contracts = contracts
            beSignedContractReleases.push(intrinsicResolve)
        }

        //待签约的策略身份授权和签约授权校验
        await this.validatePolicyIdentityAndSignAuth(beSignedContractReleases, true)

        return ctx.service.releaseService.batchSignAndBindReleaseSchemeContracts(releaseScheme, updatedResolveReleases).catch(error => {
            console.error('创建发行批量签约异常:', error)
            releaseScheme.updateOne({contractStatus: -1}).exec()
        })
    }

    /**
     * 资源的授权方案上抛和解决参数校验
     * @param dependencies
     * @param resolveReleases
     * @param baseUpcastReleases
     * @param isCheckBaseUpcast
     * @returns {Promise<{resolveReleases: *, upcastReleases: Array}>}
     */
    async validateUpcastAndResolveReleaseParams(dependencies, resolveReleases, baseUpcastReleases, isCheckBaseUpcast = false) {

        //检查发行有效性,策略有效性,上抛发行是否合理,声明处理的发行是否合理以及未处理的依赖项
        var {ctx} = this
        const {upcastReleases, backlogReleases, allUntreatedReleases} = await this.getRealUpcastAndResolveReleases(dependencies, baseUpcastReleases)

        //第一个发行方案需要检查基础上抛是否在范围内
        if (isCheckBaseUpcast) {
            const invalidBaseUpcastReleases = lodash.differenceBy(baseUpcastReleases, upcastReleases, x => x.releaseId)
            if (invalidBaseUpcastReleases.length) {
                throw new ApplicationError(ctx.gettext('release-scheme-upcast-validate-failed'), {invalidBaseUpcastReleases})
            }
        }

        //未解决的发行(待办发行没有全部解决)
        const untreatedReleases = lodash.differenceBy(backlogReleases, resolveReleases, x => x.releaseId)
        if (untreatedReleases.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), {untreatedReleases})
        }

        //无效的解决(不在待办发行中)
        const invalidResolveReleases = lodash.differenceBy(resolveReleases, backlogReleases, x => x.releaseId)
        if (invalidResolveReleases.length) {
            throw new ApplicationError(ctx.gettext('params-validate-failed', 'resolveReleases'), {invalidResolveReleases})
        }

        const releaseMap = new Map(allUntreatedReleases.map(x => [x.releaseId, x.releaseName]))

        resolveReleases.forEach(item => item.releaseName = releaseMap.get(item.releaseId))

        return {resolveReleases, upcastReleases}
    }

    /**
     * 根据基础上抛获得方案的实际上抛的和需要解决的发行
     * @param dependencies 依赖项
     * @param baseUpcastReleases 基础上抛,第一次传空数组,然后返回的上抛值即为基础上抛值
     * @returns {Promise<{upcastReleases: Array, backlogReleases: Array}>}
     */
    async getRealUpcastAndResolveReleases(dependencies, baseUpcastReleases) {

        var upcastReleases = [], backlogReleases = []
        if (!dependencies.length) {
            return {upcastReleases, backlogReleases, allUntreatedReleases: []}
        }

        const dependReleases = await this.releaseProvider.find({_id: {$in: dependencies.map(x => x.releaseId)}})
        const invalidReleases = dependReleases.filter(x => x.status !== 1)
        if (invalidReleases.length) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), {invalidReleases})
        }

        const allUntreatedReleases = lodash.chain(dependReleases).map(x => x.baseUpcastReleases)
            .flattenDeep().concat(dependencies).uniqBy(x => x.releaseId).map(x => lodash.pick(x, ['releaseId', 'releaseName'])).value()

        //真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
        backlogReleases = lodash.differenceBy(allUntreatedReleases, baseUpcastReleases, x => x.releaseId)
        upcastReleases = lodash.differenceBy(allUntreatedReleases, backlogReleases, x => x.releaseId)

        return {allUntreatedReleases, upcastReleases, backlogReleases}
    }

    /**
     * 校验待签约的策略身份以及签约授权(签约授权规则目前已经放弃)
     * @param resolveReleases
     * @param isFilterSignedPolicy 是否过滤掉已经签约过的策略
     * @returns {Promise<object>}
     */
    async validatePolicyIdentityAndSignAuth(resolveReleases, isFilterSignedPolicy = true) {

        if (lodash.isEmpty(resolveReleases)) {
            return
        }

        const {ctx} = this
        const releaseIds = [], policyIds = []
        for (let i = 0, j = resolveReleases.length; i < j; i++) {
            let {releaseId, contracts} = resolveReleases[i]
            for (let x = 0, y = contracts.length; x < y; x++) {
                releaseIds.push(releaseId)
                policyIds.push(contracts[x].policyId)
            }
        }

        const authResults = await ctx.curlIntranetApi(`${ctx.webApi.authInfo}/releases/batchPolicyIdentityAuthentication?releaseIds=${releaseIds.toString()}&policyIds=${policyIds}&isFilterSignedPolicy=${isFilterSignedPolicy ? 1 : 0}`)
        const identityAuthFailedPolices = authResults.filter(x => x.authenticationResult < 1)
        if (identityAuthFailedPolices.length) {
            throw new AuthorizationError(ctx.gettext('release-policy-identity-authorization-failed'), {identityAuthFailedPolices})
        }
    }

    /**
     * 循环依赖检查
     * 检查条件为依赖的发行或者其子级所有发行中是否存在某个版本也依赖当前发行,不考虑发行的版本
     */
    async cycleDependCheck(releaseId, dependencies, deep = 1) {

        if (deep > 20) {
            throw new ApplicationError('资源嵌套层级超过系统限制')
        }
        if (lodash.isEmpty(dependencies)) {
            return {ret: false}
        }
        if (dependencies.some(x => x.releaseId === releaseId)) {
            return {ret: true, deep}
        }

        const dependReleases = await this.releaseProvider.find({_id: {$in: dependencies.map(x => x.releaseId)}}, 'resourceVersions')
        const dependResourceIds = lodash.chain(dependReleases).map(x => x.resourceVersions).flattenDeep().map(x => x.resourceId).uniq().value()
        const dependResources = await this.resourceProvider.find({resourceId: {$in: dependResourceIds}}, 'systemMeta')

        const dependSubReleases = lodash.chain(dependResources).map(m => m.systemMeta.dependencies).flattenDeep().value()

        return this.cycleDependCheck(releaseId, dependSubReleases, deep + 1)
    }

    /**
     * 生成发行方案ID
     * @param releaseId
     * @param version
     * @returns {*|string}
     */
    generateSchemeId(releaseId, version) {
        return cryptoHelper.md5(`${releaseId}-${semver.clean(version)}`)
    }
}