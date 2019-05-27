'use strict'

const lodash = require('lodash')
const Service = require('egg').Service
const {ApplicationError, AuthorizationError} = require('egg-freelog-base/error')
const {createReleaseSchemeEvent, signReleaseContractEvent} = require('../enum/resource-events')

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

        //处理的依赖和上抛基本参数数据校验
        const {upcastReleases} = await this.validateUpcastAndResolveReleaseParams(systemMeta.dependencies, resolveReleases, baseUpcastReleases)

        //待签约的策略身份授权和签约授权校验
        await this.validatePolicyIdentityAndSignAuth(resolveReleases, true)

        const model = {
            releaseId, resourceId, upcastReleases, resolveReleases, userId, version
        }

        const releaseScheme = await this.releaseSchemeProvider.create(model)

        app.emit(createReleaseSchemeEvent, releaseInfo, releaseScheme)

        ctx.service.releaseService.batchSignReleaseContracts(releaseId, resolveReleases).then(contracts => {
            app.emit(signReleaseContractEvent, releaseScheme.id, contracts)
        }).catch(error => {
            console.error('创建方案批量签约异常:', error)
            releaseScheme.updateOne({contractStatus: -1}).exec()
        })

        return releaseScheme
    }

    /**
     * 更新发行方案
     * @param releaseInfo
     * @param version
     * @param resolveReleases 可以只传递修改的部分
     * @returns {Promise<void>}
     */
    async updateReleaseScheme({releaseInfo, version, resolveReleases}) {

        const {ctx, app} = this
        const releaseScheme = await this.releaseSchemeProvider.findOne({releaseId: releaseInfo.releaseId, version})

        const invalidResolveReleases = lodash.differenceBy(resolveReleases, releaseScheme.resolveReleases, x => x.releaseId)
        if (invalidResolveReleases.length) {
            throw new ApplicationError(ctx.gettext('release-scheme-update-resolve-release-invalid-error'), {invalidResolveReleases})
        }

        const beSignedContractReleases = []
        const updatedResolveReleases = releaseScheme.toObject().resolveReleases
        for (let i = 0, j = resolveReleases.length; i < j; i++) {
            let {releaseId, contracts} = resolveReleases[i]
            let intrinsicResolve = updatedResolveReleases.find(x => x.releaseId === releaseId)
            intrinsicResolve.contracts = contracts
            beSignedContractReleases.push(intrinsicResolve)
        }

        //待签约的策略身份授权和签约授权校验
        await this.validatePolicyIdentityAndSignAuth(beSignedContractReleases, true)
        await releaseScheme.updateOne({resolveReleases: updatedResolveReleases})

        ctx.service.releaseService.batchSignReleaseContracts(releaseInfo.releaseId, beSignedContractReleases).then(contracts => {
            app.emit(signReleaseContractEvent, {schemeId: releaseScheme.id, contracts})
        })

        return releaseScheme
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
        const releasePolicies = []
        for (let i = 0, j = resolveReleases.length; i < j; i++) {
            let resolveRelease = resolveReleases[i]
            for (let x = 0, y = resolveRelease.contracts.length; x < y; x++) {
                releasePolicies.push(`${resolveRelease.releaseId}-${resolveRelease.contracts[x].policyId}`)
            }
        }

        const authResults = await ctx.curlIntranetApi(`${ctx.webApi.authInfo}/releasePolicyIdentityAuthentication?releasePolicies=${releasePolicies.toString()}&isFilterSignedPolicy=${isFilterSignedPolicy ? 1 : 0}`)
        const identityAuthFailedPolices = authResults.filter(x => x.status !== 1)
        if (identityAuthFailedPolices.length) {
            throw new AuthorizationError(ctx.gettext('release-policy-identity-authorization-failed'), {identityAuthFailedPolices})
        }
    }


    /**
     * 校验用来解决依赖的合约是否合法有效
     * @param releaseScheme
     * @returns {Promise<void>}
     */
    // async validateContractLegality(releaseId, resolveReleases) {
    //
    //     const {ctx} = this
    //
    //     const changedContracts = lodash.reduce(resolveReleases, (value, item) => value.concat(item.contracts.map(x => x.contractId)), []).filter(x => x)
    //     if (!changedContracts.length) {
    //         return
    //     }
    //     //如果没有发行ID,则代表新创建.新创建的发行里面存在合约就是错误
    //     if (!releaseId) {
    //         throw new ArgumentError(ctx.gettext('params-validate-failed', 'resolveReleases'), resolveReleases)
    //     }
    //
    //     const contractMap = await ctx.curlIntranetApi(`${ctx.webApi.contractInfo}/list?contractIds=${changedContracts.toString()}`)
    //         .then(list => new Map(list.map(x => [x.contractId, x])))
    //
    //     const invalidContracts = []
    //     for (let i = 0, j = resolveReleases.length; i < j; i++) {
    //         const resolveRelease = resolveReleases[i]
    //         for (let x = 0, y = resolveRelease.contracts.length; x < y; x++) {
    //             const {contractId, policyId} = resolveRelease.contracts[x]
    //             const contractInfo = contractMap.get(contractId)
    //             if (!contractInfo || contractInfo.partyTwo !== releaseId || contractInfo.status === 6
    //                 || contractInfo.partyOne !== resolveRelease.releaseId || contractInfo.segmentId !== policyId) {
    //                 invalidContracts.push(resolveRelease)
    //             }
    //         }
    //     }
    //     if (invalidContracts.length) {
    //         throw new ArgumentError(ctx.gettext('params-validate-failed', 'resolveReleases'), invalidContracts)
    //     }
    // }

    /**
     * 更新发行方案
     * @param releaseInfo
     * @param schemeName
     * @param upcastReleases
     * @param resolveReleases
     * @param priority
     * @returns {Promise<void>}
     */
    // async updateReleaseScheme({releaseScheme, resolveReleases}) {
    //
    //     const {ctx} = this
    //
    //     //依赖解决的部分可以切换合约.上抛则不可变动
    //     const invalidResolveReleases = lodash.differenceBy(resolveReleases, releaseScheme.resolveReleases, x => x.releaseId)
    //     if (invalidResolveReleases.length) {
    //         throw new ArgumentError(ctx.gettext('params-validate-failed', 'resolveReleases'))
    //     }
    //
    //     const changedResolveReleases = resolveReleases.filter(item => {
    //         return releaseScheme.resolveReleases.some(x => x.releaseId === item.releaseId && item.policyId !== x.policyId)
    //     })
    //     /**
    //      * TODO:如果存在变动的策略,则签约或者使用旧合约即可
    //      */
    //     if (changedResolveReleases.length) {
    //
    //     }
    //
    //     var model = {}
    //     if (lodash.isInteger(priority)) {
    //         model.priority = priority
    //     }
    //     if (lodash.isString(schemeName)) {
    //         model.schemeName = schemeName
    //     }
    //
    //     return this.releaseProvider.updateOne({_id: releaseScheme.id}, model)
    // }

    /**
     * 资源的授权方案参数校验
     * @private
     */
    // async validateUpcastAndResolveReleaseParams(releaseInfo, dependencies, upcastReleases, resolveReleases) {
    //
    //     const {ctx} = this
    //     const releaseMap = new Map()
    //     const unionReleaseMap = new Map([...upcastReleases, ...resolveReleases].map(x => [x.releaseId, x]))
    //
    //     //上抛与解决的发行体之间不能存在交集
    //     const intersectionReleases = lodash.intersectionBy(upcastReleases, resolveReleases, x => x.releaseId)
    //     if (intersectionReleases.length || (upcastReleases.length + resolveReleases.length) != unionReleaseMap.size) {
    //         throw new LogicError(ctx.gettext('params-relevance-validate-failed', 'upcastReleases,resolveReleases'), {intersectionReleases})
    //     }
    //     if (unionReleaseMap.size) {
    //         await this.releaseProvider.find({_id: {$in: [...unionReleaseMap.keys()]}}).each(x => releaseMap.set(x.releaseId, x))
    //     }
    //
    //     //检查发行有效性,策略有效性,上抛发行是否合理,声明处理的发行是否合理以及未处理的依赖项
    //     const invalidPolicies = [], invalidUpcastReleases = [], invalidResolveReleases = [],
    //         untreatedDependencies = []
    //
    //     //递归计算每一层的上抛
    //     const recursionCheckDependencies = (releases) => releases.forEach(item => {
    //
    //         const {releaseId, releaseName, quoters} = item
    //         const releaseParam = unionReleaseMap.get(releaseId)
    //         if (!releaseParam) {
    //             untreatedDependencies.push({releaseId, releaseName})
    //             return
    //         }
    //         const releaseInfo = releaseMap.get(releaseId)
    //         const isResolveRelease = Boolean(releaseParam.contracts)
    //         if (!releaseInfo || releaseInfo.status !== 1) {
    //             isResolveRelease ? invalidResolveReleases.push(releaseParam) : invalidUpcastReleases.push(releaseParam)
    //             return
    //         }
    //
    //         if (isResolveRelease && lodash.differenceWith(releaseParam.contracts, releaseInfo.policies, (x, y) => x.policyId === y.policyId && y.status === 1).length) {
    //             invalidPolicies.push(releaseParam)
    //             return
    //         }
    //
    //         releaseParam.validate = true
    //         releaseParam.releaseName = releaseInfo.releaseName
    //         if (!releaseParam.quoters) {
    //             releaseParam.quoters = quoters
    //         } else {
    //             releaseParam.quoters = lodash.unionBy(releaseParam.quoters.concat(quoters), x => x.releaseId)
    //         }
    //         //声明解决的,则需要递归计算子依赖处理情况
    //         isResolveRelease && recursionCheckDependencies(releaseInfo.baseUpcastReleases)
    //     })
    //
    //     dependencies.map(x => x.quoters = [releaseInfo])
    //
    //     recursionCheckDependencies(dependencies || [])
    //
    //     if (invalidUpcastReleases.length) {
    //         throw new ApplicationError(ctx.gettext('resource-depend-release-info-validate-failed'), {invalidUpcastReleases})
    //     }
    //     if (invalidResolveReleases.length) {
    //         throw new ApplicationError(ctx.gettext('resource-depend-release-info-validate-failed'), {invalidResolveReleases})
    //     }
    //     if (untreatedDependencies.length) {
    //         throw new ApplicationError(ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), {untreatedDependencies})
    //     }
    //     if (invalidPolicies.length) {
    //         throw new ApplicationError(ctx.gettext('release-available-policy-not-found'), {invalidPolicies})
    //     }
    //     if (upcastReleases.some(x => !x.validate)) {
    //         throw new ApplicationError(ctx.gettext('params-validate-failed', 'upcastReleases'))
    //     }
    //     if (resolveReleases.some(x => !x.validate)) {
    //         throw new ApplicationError(ctx.gettext('params-validate-failed', 'resolveReleases'))
    //     }
    //     return {upcastReleases, resolveReleases}
    // }

    /**
     * 资源的授权方案参数校验
     * @private
     */
    // async validateUpcastAndResolveReleaseParams(dependencies, upcastReleases, resolveReleases) {
    //
    //     const {ctx} = this
    //     const unionReleases = [...upcastReleases, ...resolveReleases]
    //
    //     //上抛与解决的发行体之间不能存在交集
    //     const intersectionReleases = lodash.intersectionBy(upcastReleases, resolveReleases, x => x.releaseId)
    //     if (intersectionReleases.length) {
    //         throw new LogicError(ctx.gettext('params-relevance-validate-failed', 'upcastReleases,resolveReleases'), {intersectionReleases})
    //     }
    //
    //     //检查是否存在未处理的(依赖了,但是没上抛,也没处理)发行
    //     const untreatedReleases = lodash.differenceBy(dependencies, unionReleases, x => x.releaseId)
    //     if (untreatedReleases.length) {
    //         throw new LogicError(ctx.gettext('params-relevance-validate-failed', 'upcastReleases,resolveReleases'), {untreatedReleases})
    //     }
    //
    //     //是否存在多余的上抛或者处理(不在依赖范围内的)
    //     const redundantReleases = lodash.differenceBy(unionReleases, dependencies, x => x.releaseId)
    //     if (redundantReleases.length) {
    //         throw new LogicError(ctx.gettext('params-relevance-validate-failed', 'upcastReleases,resolveReleases'), {redundantReleases})
    //     }
    //
    //     //检查发行的状态和有效性,以及策略ID的关联正确性
    //     const invalidReleases = [], invalidPolicies = []
    //     const releaseMap = await this.releaseProvider.find({_id: {$in: unionReleases.map(x => x.releaseId)}})
    //         .then(list => new Map(list.map(x => [x.releaseId, x])))
    //
    //     unionReleases.forEach(item => {
    //         let releaseInfo = releaseMap.get(item.releaseId)
    //         if (releaseInfo) {
    //             item.releaseName = releaseInfo.releaseName
    //         }
    //         if (!releaseInfo || releaseInfo.status !== 1) {
    //             invalidReleases.push(item)
    //         }
    //         if (!releaseInfo.policies.some(x => x.policyId === item.policyId && x.status === 1)) {
    //             invalidPolicies.push(item)
    //         }
    //     })
    //     if (invalidReleases.length) {
    //         throw new ApplicationError(ctx.gettext('resource-depend-validate-failed'), {invalidReleases})
    //     }
    //     if (invalidPolicies.length) {
    //         throw new ApplicationError(ctx.gettext('params-validate-failed', 'policyId'), {invalidPolicies})
    //     }
    //
    //     return {upcastReleases, resolveReleases}
    // }
}