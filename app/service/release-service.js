'use strict'

const semver = require('semver')
const lodash = require('lodash')
const Service = require('egg').Service
const {ApplicationError} = require('egg-freelog-base/error')
const {createReleaseSchemeEvent, releaseSchemeBindContractEvent} = require('../enum/resource-events')
const releasePolicyCompiler = require('egg-freelog-base/app/extend/policy-compiler/release-policy-compiler')

module.exports = class ReleaseService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.releaseSchemeProvider = app.dal.releaseSchemeProvider
    }

    /**
     * 创建一个发行
     * @param resourceInfo
     * @param releaseName
     * @param intro
     * @param previewImages
     * @param baseUpcastReleases
     * @param resolveReleases
     * @param policies
     * @param version
     * @returns {Promise<releaseInfo>}
     */
    async createRelease({resourceInfo, releaseName, intro, previewImages, baseUpcastReleases, policies, resolveReleases, version}) {

        const {ctx, app, userId} = this
        const releaseId = app.mongoose.getNewObjectId()
        const {resourceId, resourceType, systemMeta} = resourceInfo

        //上抛和处理的依赖基本参数数据校验
        const {upcastReleases} = await ctx.service.releaseSchemeService.validateUpcastAndResolveReleaseParams(systemMeta.dependencies, resolveReleases, baseUpcastReleases, true)

        //待签约的策略身份授权和签约授权校验
        await ctx.service.releaseSchemeService.validatePolicyIdentityAndSignAuth(resolveReleases, false)

        const {username = null} = ctx.request.identityInfo.userInfo
        if (username === null) {
            throw new ApplicationError(ctx.gettext('用户名缺失,请补充账户信息'))
        }

        const createDate = new Date()
        const releaseInfo = {
            _id: releaseId, username, policies: [],
            userId, resourceType, intro, previewImages, createDate,
            releaseName: `${username}/${releaseName}`,
            latestVersion: {resourceId, version, createDate},
            resourceVersions: [{resourceId, version, createDate}],
            baseUpcastReleases: upcastReleases,
            updateDate: createDate
        }
        if (!lodash.isEmpty(policies)) {
            releaseInfo.policies = this._compilePolicies(policies)
            //releaseInfo.signAuth = releaseInfo.policies.reduce((releaseSignAuth, item) => releaseSignAuth | item.signAuth, 0)
            //如果存在启用的策略,则发行自动上架
            releaseInfo.status = releaseInfo.policies.some(x => x.status === 1) ? 1 : 0
        }

        //contractActivatedStatus需要考虑何时计算.以及后续对合同状态的监听
        const releaseSchemeInfo = {
            releaseId, resourceId, upcastReleases, resolveReleases, userId, version,
            contractStatus: resolveReleases.length ? 0 : 1, createDate, updateDate: createDate
        }

        const releaseCreateTask = this.releaseProvider.create(releaseInfo)
        const releaseSchemeCreateTask = this.releaseSchemeProvider.create(releaseSchemeInfo)

        const [release, releaseScheme] = await Promise.all([releaseCreateTask, releaseSchemeCreateTask]).catch(error => {
            this.releaseProvider.deleteOne({_id: releaseId})
            this.releaseSchemeProvider.deleteOne({releaseId})
            throw error
        })

        app.emit(createReleaseSchemeEvent, release, releaseScheme)

        this.resourceProvider.updateOne({resourceId}, {isReleased: 1})

        //发行的状态应该是动态计算的,包括上架的策略,依赖的发行是否签约完成,并且获得激活授权
        return this.batchSignAndBindReleaseSchemeContracts(releaseScheme).catch(error => {
            console.error('创建发行批量签约异常:', error)
            releaseScheme.updateOne({contractStatus: -1}).exec()
        }).then(() => {
            return release
        })
    }


    /**
     * 更新发行信息
     * @param releaseInfo
     * @param releaseName
     * @param intro
     * @param previewImages
     * @param policyInfo
     * @returns {Promise<void>}
     */
    async updateReleaseInfo({releaseInfo, intro, previewImages, policyInfo}) {

        var model = {}
        if (lodash.isString(intro)) {
            model.intro = intro
        }
        if (lodash.isArray(previewImages)) {
            model.previewImages = previewImages
        }
        if (policyInfo) {
            model.policies = this._policiesHandler({releaseInfo, policyInfo})
            model.status = model.policies.some(x => x.status === 1) ? 1 : 0
        }

        return this.releaseProvider.findOneAndUpdate({_id: releaseInfo.releaseId}, model, {new: true})
    }

    /**
     * 获取发行的依赖树
     * @param releaseInfo
     * @param resourceVersion
     * @param isContainRootNode
     * @param maxDeep
     * @param omitFields
     * @returns {Promise<*>}
     */
    async releaseDependencyTree(releaseInfo, resourceVersion, isContainRootNode, maxDeep = 100, omitFields = []) {

        const resourceInfo = await this.resourceProvider.findOne({resourceId: resourceVersion.resourceId}, 'systemMeta.dependencies')

        if (!isContainRootNode) {
            return this._buildDependencyTree(resourceInfo.systemMeta.dependencies, maxDeep, 1, omitFields)
        }

        return [{
            releaseId: releaseInfo.releaseId,
            releaseName: releaseInfo.releaseName,
            version: resourceVersion.version,
            versionRange: resourceVersion.version,
            resourceId: resourceVersion.resourceId,
            baseUpcastReleases: releaseInfo.baseUpcastReleases,
            dependencies: await this._buildDependencyTree(resourceInfo.systemMeta.dependencies, maxDeep, 1, omitFields)
        }]
    }

    /**
     * 发行授权树
     * @param releaseInfo
     * @param resourceVersion
     * @returns {Promise<Array>}
     */
    async releaseAuthTree(releaseInfo, resourceVersion) {

        const dependencyTree = await this.releaseDependencyTree(releaseInfo, resourceVersion, true)

        const releaseSchemeMap = await this._getReleaseSchemesFormDependencyTree(dependencyTree).then(list => new Map(list.map(x => [`${x.releaseId}_${x.resourceId}`, x])))

        const recursionAuthTree = (releaseNode) => {

            const releaseScheme = releaseSchemeMap.get(`${releaseNode.releaseId}_${releaseNode.resourceId}`)
            return releaseScheme.resolveReleases.map(resolveRelease => {
                const list = this._findReleaseVersionFromDependencyTree(releaseNode.dependencies, resolveRelease)
                return {
                    releaseId: resolveRelease.releaseId,
                    releaseName: resolveRelease.releaseName,
                    contracts: resolveRelease.contracts,
                    versions: lodash.uniqWith(list, (x, y) => x.releaseId === y.releaseId && x.version === y.version).map(item => Object({
                        version: item.version,
                        resolveReleases: recursionAuthTree(item)
                    })),
                    versionRanges: lodash.chain(list).map(x => x.versionRange).uniq().value()
                }
            })
        }

        return recursionAuthTree(dependencyTree[0])
    }


    /**
     * 发行的上抛树
     * @param releaseInfo
     * @param resourceVersion
     * @returns {Promise<Array>}
     */
    async releaseUpcastTree(releaseInfo, resourceVersion, maxDeep = 100) {

        const dependencyTree = await this.releaseDependencyTree(releaseInfo, resourceVersion, true)

        const recursionUpcastTree = (releaseNode, currDeep = 1) => releaseNode.baseUpcastReleases.map(upcastRelease => {

            const list = this._findReleaseVersionFromDependencyTree(releaseNode.dependencies, upcastRelease)

            return {
                releaseId: upcastRelease.releaseId,
                releaseName: upcastRelease.releaseName,
                versions: lodash.uniqBy(list, x => x.version).map(item => Object({version: item.version})),
                upcastReleases: (currDeep >= maxDeep || !list.length) ? [] : recursionUpcastTree(list[0], currDeep + 1),
            }
        })

        return recursionUpcastTree(dependencyTree[0])
    }

    /**
     * 批量签约
     * @returns {Promise<Array>}
     */
    async batchSignAndBindReleaseSchemeContracts(schemeInfo, changedResolveRelease = []) {

        const {releaseId, schemeId, resolveReleases} = schemeInfo
        const beSignReleases = changedResolveRelease.length ? changedResolveRelease : resolveReleases
        if (!beSignReleases.length) {
            return []
        }

        const {ctx, app} = this
        const contracts = await ctx.curlIntranetApi(`${ctx.webApi.contractInfo}/batchCreateReleaseContracts`, {
            method: 'post', contentType: 'json', data: {
                targetId: releaseId,
                partyTwoId: releaseId,
                contractType: app.contractType.ResourceToResource,
                signReleases: beSignReleases.map(item => Object({
                    releaseId: item.releaseId,
                    policyIds: item.contracts.map(x => x.policyId)
                }))
            }
        })

        const contractMap = new Map(contracts.map(x => [`${x.partyOne}_${x.policyId}`, x]))

        const updatedResolveReleases = resolveReleases.map(resolveRelease => {
            let changedResolveRelease = beSignReleases.find(x => x.releaseId === resolveRelease.releaseId)
            if (changedResolveRelease) {
                resolveRelease.contracts = changedResolveRelease.contracts.map(contractInfo => {
                    let signedContractInfo = contractMap.get(`${changedResolveRelease.releaseId}_${contractInfo.policyId}`)
                    if (signedContractInfo) {
                        contractInfo.contractId = signedContractInfo.contractId
                    }
                    return contractInfo
                })
            }
            return resolveRelease
        })

        return this.releaseSchemeProvider.findOneAndUpdate({_id: schemeId}, {
            resolveReleases: updatedResolveReleases, contractStatus: 2
        }, {new: true}).then(model => {
            app.emit(releaseSchemeBindContractEvent, model, Boolean(changedResolveRelease.length))
            return model
        })
    }


    /**
     * 从依赖树中获取指定的所有发行版本
     * @param dependencies
     * @param release
     * @returns {Array}
     * @private
     */
    _findReleaseVersionFromDependencyTree(dependencies, release, list = []) {

        return dependencies.reduce((acc, dependency) => {
            if (dependency.releaseId === release.releaseId) {
                acc.push(dependency)
            }
            //如果依赖项未上抛该发行,则终止检查子级节点
            if (!dependency.baseUpcastReleases.some(x => x.releaseId === release.releaseId)) {
                return acc
            }
            return this._findReleaseVersionFromDependencyTree(dependency.dependencies, release, acc)
        }, list)
    }

    /**
     * 构建依赖树(后面可以对tree做同级合并,优化查询次数)
     * @param resourceIds
     * @private
     */
    async _buildDependencyTree(dependencies, maxDeep = 100, currDeep = 1, omitFields = []) {

        if (!dependencies.length || currDeep++ > maxDeep) {
            return []
        }

        const resourceIds = []
        const dependencyMap = new Map(dependencies.map(item => [item.releaseId, {versionRange: item.versionRange}]))
        const releaseList = await this.releaseProvider.find({_id: {$in: Array.from(dependencyMap.keys())}})

        for (let i = 0, j = releaseList.length; i < j; i++) {
            const {releaseId, resourceVersions} = releaseList[i]
            const dependencyInfo = dependencyMap.get(releaseId)
            const {version, resourceId} = this._getReleaseMaxSatisfying(resourceVersions, dependencyInfo.versionRange)
            dependencyInfo.version = version
            dependencyInfo.resourceId = resourceId
            resourceIds.push(resourceId)
        }

        const resourceMap = await this.resourceProvider.find({resourceId: {$in: resourceIds}})
            .then(list => new Map(list.map(x => [x.resourceId, x])))

        for (var value of dependencyMap.values()) {
            value.resourceInfo = resourceMap.get(value.resourceId)
        }

        const results = [], tasks = []
        for (let i = 0, j = releaseList.length; i < j; i++) {
            let {releaseId, releaseName, baseUpcastReleases} = releaseList[i]
            let {resourceInfo, versionRange, version} = dependencyMap.get(releaseId)
            let result = {
                releaseId, releaseName, version, versionRange, baseUpcastReleases,
                resourceId: resourceInfo.resourceId,
            }
            if (omitFields.length) {
                result = lodash.omit(result, omitFields)
            }
            tasks.push(this._buildDependencyTree(resourceInfo.systemMeta.dependencies || [], maxDeep, currDeep, omitFields)
                .then(list => result.dependencies = list))
            results.push(result)
        }

        return Promise.all(tasks).then(() => results)
    }


    /**
     * 根据依赖树获取所有的发行的发行方案
     * @param dependencyTree
     * @returns {Promise<*>}
     * @private
     */
    async _getReleaseSchemesFormDependencyTree(dependencyTree) {

        const releaseVersionMap = new Map()
        const recursion = (dependencies) => dependencies.forEach((item) => {
            if (releaseVersionMap.has(item.releaseId)) {
                releaseVersionMap.get(item.releaseId).push(item.resourceId)
            } else {
                releaseVersionMap.set(item.releaseId, [item.resourceId])
            }
            recursion(item.dependencies)
        })

        recursion(dependencyTree)

        const condition = []
        for (var [key, value] of releaseVersionMap) {
            condition.push({releaseId: key, resourceId: {$in: lodash.uniq(value)}})
        }

        return this.releaseSchemeProvider.find({$or: condition})
    }

    /**
     * 获取发行的最佳匹配版本
     * @param resourceVersions
     * @param versionRange
     * @returns {*}
     * @private
     */
    _getReleaseMaxSatisfying(resourceVersions, versionRange) {

        const version = semver.maxSatisfying(resourceVersions.map(x => x.version), versionRange)

        return resourceVersions.find(x => x.version === version)
    }

    /**
     * 编译策略
     * @param policies
     * @returns {*}
     * @private
     */
    _compilePolicies(policies) {

        return policies.map(({policyName, policyText}) => {

            let signAuth = 0
            let policyInfo = releasePolicyCompiler.compile(policyText, policyName)
            if (policyText.toLowerCase().includes('presentable')) {
                signAuth = signAuth | 2
            }
            if (policyText.toLowerCase().includes('recontractable')) {
                signAuth = signAuth | 1
            }
            policyInfo.signAuth = signAuth

            return policyInfo
        })
    }

    /**
     * 处理策略段变更
     * @param releaseInfo
     * @param policyInfo
     * @returns {*}
     * @private
     */
    _policiesHandler({releaseInfo, policyInfo}) {

        const {ctx} = this
        const {addPolicies, updatePolicies} = policyInfo
        const oldPolicyMap = new Map(releaseInfo.policies.map(x => [x.policyId, x]))

        if (!lodash.isEmpty(updatePolicies)) {
            for (let i = 0, j = updatePolicies.length; i < j; i++) {
                let item = updatePolicies[i]
                let targetPolicy = oldPolicyMap.get(item.policyId)
                if (!targetPolicy) {
                    throw new ApplicationError(ctx.gettext('params-validate-failed', 'policyId'), item)
                }
                targetPolicy.status = item.status
                targetPolicy.policyName = item.policyName
            }
        }

        if (!lodash.isEmpty(addPolicies)) {
            for (let i = 0, j = addPolicies.length; i < j; i++) {
                let item = addPolicies[i]
                let newPolicy = releasePolicyCompiler.compile(item.policyText, item.policyName)
                if (oldPolicyMap.has(newPolicy.policyId)) {
                    throw new ApplicationError(ctx.gettext('policy-create-duplicate-error'), item)
                }
                oldPolicyMap.set(newPolicy.policyId, newPolicy)
            }
        }

        return Array.from(oldPolicyMap.values())
    }

    /**
     * 检查循环依赖(当前版本不在进行循环依赖检测,允许存在,合约层面也开放自己与自己签约)
     * @param releaseName
     * @param dependencies
     * @returns boolean
     * @private
     */
    _isExistCircleDependency(releaseName, dependencies) {

        if (!dependencies.length) {
            return false
        }
        if (dependencies.some(x => x.releaseName.toLocaleString() === releaseName.toLocaleString())) {
            return true
        }

        return false

        //目前release对应的依赖是不确定的(存在多个方案,每个方案依赖可能不一致).
        //所以目前只能做第一层级的依赖检测,除非资源的依赖和版本以后固定下来(确定固定版本,而非范围版本).
        //const releaseMap = await this.releaseProvider.find({_id: {$in: dependencies.map(x => x.releaseId)}})
        //   .then(list => new Map(list.map(x => [x.releaseId, x])))
        //const checkResult = await this._isExistCircleDependency(releaseName, subDependencies)
        //return subDependencies.length && checkResult
    }
}