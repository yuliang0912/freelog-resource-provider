'use strict'

const lodash = require('lodash')
const Service = require('egg').Service
const authSchemeEvents = require('../enum/auth-scheme-events')
const {ApplicationError, LogicError} = require('egg-freelog-base/error')

class AuthSchemeService extends Service {

    constructor({app}) {
        super(...arguments)
        this.resourceProvider = app.dal.resourceProvider
        this.authSchemeProvider = app.dal.authSchemeProvider
        this.schemeAuthTreeProvider = app.dal.schemeAuthTreeProvider
    }

    /**
     * 查找授权方案列表
     * @param authSchemeIds
     * @param resourceIds
     * @param authSchemeStatus
     * @param policyStatus
     * @returns {PromiseLike<void> | Promise<void>}
     */
    findAuthSchemeList({authSchemeIds, resourceIds, authSchemeStatus, policyStatus}) {

        const condition = {}
        if (authSchemeIds) {
            condition._id = {$in: authSchemeIds}
        }
        if (resourceIds) {
            condition.resourceId = {$in: resourceIds}
        }
        if (authSchemeStatus !== undefined) {
            condition.status = authSchemeStatus
        }

        return this.authSchemeProvider.find(condition).then(dataList => this._filterPolicyStatus(dataList, policyStatus))
    }

    /**
     * 创建授权点
     * @param authSchemeName
     * @param resourceInfo
     * @param policies
     * @param languageType
     * @param dutyStatements
     * @param bubbleResources
     * @param isPublish
     * @returns {Promise<PromiseLike<T> | Promise<T>>}
     */
    async createAuthScheme({authSchemeName, resourceInfo, policies, languageType, dutyStatements, bubbleResources, isPublish}) {

        const {app, ctx, authSchemeProvider} = this

        resourceInfo.systemMeta.dependencies = resourceInfo.systemMeta.dependencies || []

        const authScheme = {
            policy: [],
            status: isPublish ? 1 : 0,
            userId: ctx.request.userId,
            resourceId: resourceInfo.resourceId,
            authSchemeName, languageType, dutyStatements, bubbleResources,
            dependCount: resourceInfo.systemMeta.dependCount || resourceInfo.systemMeta.dependencies.length,
        }

        if (policies) {
            authScheme.policy = this._policiesHandler({authScheme, policies})
        }

        const untreatedResources = await this._checkStatementAndBubble({authScheme, resourceInfo})
        if (authScheme.status === 1 && (!authScheme.policy.length || dutyStatements.length || untreatedResources.length)) {
            throw new LogicError('当前状态无法直接发布,请检查是否存在有效策略,以及全部处理好依赖资源', {
                policyCount: authScheme.policy.length,
                dutyStatementsCount: dutyStatements.length,
                untreatedResources
            })
        }

        await this._updateSchemeAuthTree(authScheme)

        return authSchemeProvider.create(authScheme).tap(() => {
            app.emit(authSchemeEvents.createAuthSchemeEvent, {authScheme})
            if (policies) {
                app.emit(authSchemeEvents.authPolicyModifyEvent, {authScheme})
            }
        })
    }

    /**
     * 更新授权方案
     * @param authScheme
     * @param authSchemeName
     * @param policies
     * @param dutyStatements
     * @param bubbleResources
     * @returns {Promise<Promise<void>|IDBRequest|void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policies, dutyStatements, bubbleResources}) {

        const {resourceProvider, authSchemeProvider} = this
        const model = {authSchemeName: authSchemeName || authScheme.authSchemeName}

        if (policies) {
            model.policy = this._policiesHandler({authScheme, policies})
            if (authScheme.status === 1 && !model.policy.some(x => x.status === 1)) {
                throw new ApplicationError('已经发布的授权方案最少需要一个有效的授权策略')
            }
        }
        if (dutyStatements || bubbleResources) {
            model.dutyStatements = authScheme.dutyStatements = dutyStatements || authScheme.dutyStatements
            model.bubbleResources = authScheme.bubbleResources = bubbleResources || authScheme.bubbleResources
            const resourceInfo = await resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
            await this._checkStatementAndBubble({authScheme, resourceInfo})
        }

        return authSchemeProvider.updateOne({_id: authScheme.authSchemeId}, model).tap(() => {
            if (policies) {
                this.app.emit(authSchemeEvents.authPolicyModifyEvent, {authScheme})
            }
        })
    }

    /**
     * 授权点批量签约
     */
    async batchSignContracts({authScheme}) {

        const {ctx, app, resourceProvider} = this

        if (authScheme.status !== 0) {
            throw new ApplicationError('只有初始状态的授权方案才能发布', {currentStatus: authScheme.status})
        }
        if (!authScheme.policy.some(x => x.status === 1)) {
            throw new ApplicationError('授权方案缺少有效授权策略,无法发布', {currentStatus: authScheme.status})
        }

        const resourceInfo = await resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
        const untreatedResources = await this._checkStatementAndBubble({authScheme, resourceInfo})

        if (untreatedResources.length) {
            throw new LogicError('声明与上抛的数据不全,无法发布', {untreatedResources})
        }

        var contracts = []
        const dutyStatementMap = new Map(authScheme.dutyStatements.map(x => [x.authSchemeId, x]))
        if (dutyStatementMap.size) {
            contracts = await ctx.curlIntranetApi(`${ctx.webApi.contractInfo}/batchCreateAuthSchemeContracts`, {
                method: 'post',
                contentType: 'json',
                data: {
                    partyTwo: authScheme.authSchemeId,
                    contractType: app.contractType.ResourceToResource,
                    signObjects: authScheme.dutyStatements.map(x => new Object({
                        targetId: x.authSchemeId,
                        segmentId: x.policySegmentId
                    }))
                },
                dataType: 'json'
            })
        }

        contracts.forEach(x => dutyStatementMap.get(x.targetId).contractId = x.contractId)

        const associatedContracts = contracts.map(x => new Object({
            authSchemeId: x.targetId,
            contractId: x.contractId
        }))

        await authScheme.updateOne({
            status: 1, associatedContracts, dutyStatements: Array.from(dutyStatementMap.values()),
        }).then(() => {
            authScheme.status = 1
            authScheme.associatedContracts = associatedContracts
            app.emit(authSchemeEvents.releaseAuthSchemeEvent, {authScheme})
        })

        await this._updateSchemeAuthTree(authScheme)

        return contracts
    }

    /**
     * 删除授权方案
     * @param authSchemeId
     */
    async deleteAuthScheme(authScheme) {
        await authScheme.updateOne({status: 4}).then(() => {
            authScheme.status = 4
            this.app.emit(authSchemeEvents.deleteAuthSchemeEvent, {authScheme})
        })
        return true
    }

    /**
     * 构建授权方案的授权树
     * @param presentable
     * @private
     */
    async _updateSchemeAuthTree(authScheme) {

        if (authScheme.status !== 1) {
            return
        }

        const result = await this._buildContractAuthTree(authScheme.associatedContracts)

        return this.schemeAuthTreeProvider.createOrUpdateAuthTree({
            authSchemeId: authScheme.authSchemeId,
            resourceId: authScheme.resourceId,
            authTree: this._flattenAuthTree(result)
        })
    }

    /**
     * 平铺授权树
     * @param schemeAuthTree
     * @private
     */
    _flattenAuthTree(schemeAuthTree) {

        const dataList = []

        const recursion = (children, parentAuthSchemeId = '') => {
            children.forEach(x => {
                let {deep, contractId, authSchemeId, resourceId, children} = x
                dataList.push({contractId, authSchemeId, resourceId, parentAuthSchemeId, deep})
                children.length && recursion(children, authSchemeId)
            })
        }

        recursion(schemeAuthTree)

        return dataList
    }

    /**
     * 生产合同的构建树
     * @param contracts
     * @private
     */
    async _buildContractAuthTree(associatedContracts = [], deep = 0) {

        if (!associatedContracts.length) {
            return []
        }

        const dataList = []
        const authSchemeIds = associatedContracts.map(x => x.authSchemeId)
        const authSchemeMap = await this.authSchemeProvider.find({_id: {$in: authSchemeIds}})
            .then(dataList => new Map(dataList.map(x => [x.authSchemeId, x])))

        if (associatedContracts.length !== authSchemeMap.size) {
            throw new ApplicationError('授权树数据完整性校验失败')
        }

        for (let i = 0, j = associatedContracts.length; i < j; i++) {
            let {authSchemeId, contractId} = associatedContracts[i]
            let currentAuthScheme = authSchemeMap.get(authSchemeId)
            dataList.push({
                deep,
                authSchemeId,
                contractId,
                resourceId: currentAuthScheme.resourceId,
                children: await this._buildContractAuthTree(currentAuthScheme.associatedContracts, deep + 1)
            })
        }

        return dataList
    }

    /**
     * 检查重签授权
     * @returns {Promise<void>}
     * @private
     */
    async _checkReContractAuth(authSchemeIds) {

        const contractIds = []
        const recursion = async (authSchemeIds) => {
            if (!authSchemeIds.length) {
                return
            }
            const _authSchemeIds = []
            const authSchemeInfos = await this.authSchemeProvider.find({_id: {$in: authSchemeIds}})
            authSchemeInfos.forEach(authSchemeInfo => authSchemeInfo.dutyStatements.forEach(dutyStatement => {
                contractIds.push(dutyStatement.contractId)
                _authSchemeIds.push(dutyStatement.authSchemeId)
            }))
            return recursion(_authSchemeIds)
        }
        await recursion(authSchemeIds)
    }

    /**
     * 检查上抛和声明的数据是否在上抛树上,而且依赖关系正确
     * 返回未处理的上抛(没声明也没显示上抛)
     * @private
     */
    async _checkStatementAndBubble({authScheme, resourceInfo}) {

        const {dutyStatements, bubbleResources} = authScheme
        const intersection = lodash.intersectionBy(dutyStatements, bubbleResources, 'resourceId')
        if (intersection.length) {
            throw new LogicError('声明与上抛的资源数据中存在交集', intersection)
        }

        const authSchemeIds = dutyStatements.map(item => item.authSchemeId)
        const dutyStatementMap = new Map(dutyStatements.map(x => [x.resourceId, x]))
        const bubbleResourceMap = new Map(bubbleResources.map(x => [x.resourceId, x]))
        const authSchemeInfoMap = await this.authSchemeProvider.find({_id: {$in: authSchemeIds}})
            .then(dataList => new Map(dataList.map(x => [x.authSchemeId, x])))

        const validateFailedStatements = dutyStatements.filter(statement => {
            let authScheme = statement.authSchemeInfo = authSchemeInfoMap.get(statement.authSchemeId)
            return !authScheme || authScheme.resourceId !== statement.resourceId // || authScheme.status !== 1
                || !authScheme.policy.some(x => x.segmentId === statement.policySegmentId) // && x.status === 1)
        })
        if (validateFailedStatements.length) {
            throw new ApplicationError('dutyStatements数据校验失败,请检查resourceId与authSchemeId,policySegmentId以及他们的状态是否符合条件', validateFailedStatements)
        }

        const untreatedResources = []
        const recursion = (resources) => resources.forEach(item => {
            let dutyStatement = dutyStatementMap.get(item.resourceId)
            let bubbleResource = bubbleResourceMap.get(item.resourceId)
            if (bubbleResource) {
                bubbleResource.validate = true
                bubbleResource.resourceName = item.resourceName
            }
            else if (dutyStatement) {
                dutyStatement.validate = true
                dutyStatement.resourceName = item.resourceName
                recursion(authSchemeInfoMap.get(dutyStatement.authSchemeId).bubbleResources)
            }
            else {
                untreatedResources.push(item)
            }
        })

        recursion(resourceInfo.systemMeta.dependencies || [])

        const invalidStatements = dutyStatements.filter(x => !x.validate)
        if (invalidStatements.length) {
            throw new ApplicationError('dutyStatements数据校验失败,存在无效的声明', {invalidStatements: invalidStatements.map(x => new Object({resourceId: x.resourceId}))})
        }

        const invalidBubbleResources = bubbleResources.filter(x => !x.validate)
        if (invalidBubbleResources.length) {
            throw new ApplicationError('bubbleResources中存在无效上抛', invalidBubbleResources)
        }

        return untreatedResources
    }

    /**
     * 检查是否存在有效的授权方案
     */
    isExistValidAuthScheme(resourceId) {
        return this.authSchemeProvider.count({resourceId, status: {$in: [0, 1]}}).then(count => count > 0)
    }

    /**
     * 过滤掉指定的授权状态
     * @param dataList
     * @param policyStatus
     * @returns {Promise<void>}
     * @private
     */
    _filterPolicyStatus(dataList, policyStatus) {

        if (policyStatus === 1 || policyStatus === 0) {
            dataList.forEach(item => {
                item.policy = item.policy.filter(x => x.status === policyStatus)
            })
        }

        return dataList
    }

    /**
     * 处理策略段变更
     * @param authScheme
     * @param policies
     * @returns {*}
     * @private
     */
    _policiesHandler({authScheme, policies}) {

        const {ctx} = this
        const {removePolicySegments, addPolicySegments, updatePolicySegments} = policies
        const oldPolicySegments = new Map(authScheme.policy.map(x => [x.segmentId, x]))

        removePolicySegments && removePolicySegments.forEach(item => oldPolicySegments.delete(item))

        updatePolicySegments && updatePolicySegments.forEach(item => {
            let targetPolicySegment = oldPolicySegments.get(item.policySegmentId)
            if (!targetPolicySegment) {
                throw Object.assign(new Error("未能找到需要更新的策略段"), {data: targetPolicySegment})
            }
            targetPolicySegment.policyName = item.policyName
            targetPolicySegment.status = item.status
        })

        addPolicySegments && addPolicySegments.forEach(item => {
            let newPolicy = ctx.helper.policyCompiler(item)
            if (oldPolicySegments.has(newPolicy.segmentId)) {
                throw Object.assign(new Error("不能添加已经存在的策略段"), {data: newPolicy})
            }
            oldPolicySegments.set(newPolicy.segmentId, newPolicy)
        })

        return Array.from(oldPolicySegments.values())
    }

    /**
     * 计算覆盖率 (目前未完成)
     * @private
     */
    _calculateCoverageRate({authScheme, authSchemeInfos}) {

        if (authScheme.dependCount === 0) {
            authScheme.contractCoverageRate = 100
            authScheme.statementCoverageRate = 100
            authScheme.statementState = 2 //单一资源,则全包含
            return authScheme
        }

        if (authScheme.dutyStatements.length === 0) {
            authScheme.contractCoverageRate = 0
            authScheme.statementCoverageRate = 0
            authScheme.statementState = 1 //复合资源,没声明引用,则全上抛
            return authScheme
        }

        let totalDependCount = lodash.sumBy(authSchemeInfos, m => m.dependCount)

        authScheme.statementCoverageRate = (statistics.dependCount / authScheme.dependCount).toFixed(4) * 100
        authScheme.contractCoverageRate = (statistics.signContractCount / statistics.dependCount).toFixed(4) * 100
        authScheme.statementState = authScheme.statementCoverageRate === 0 ? 1 : authScheme.statementCoverageRate === 100 ? 2 : 3

        return authScheme
    }

    /**
     * 去重,然后排除指定的部分
     * @param array
     * @param exclude
     * @returns {*[]}
     * @private
     */
    _distinctAndExclude(array, exclude = []) {
        return exclude.length
            ? [...new Set(array)].filter(x => !exclude.includes(x))
            : [...new Set(array)]
    }

    /**
     * 获取tree节点的数量
     * @param treeList
     * @param totalItem
     * @returns {number}
     * @private
     */
    _getTreeNodeCount(treeList, totalItem = 0) {

        if (!Array.isArray(treeList) || !treeList.length) {
            return totalItem
        }
        totalItem += treeList.length
        treeList.forEach(item => {
            totalItem = this._getTreeNodeCount(item.dependencies || [], totalItem)
        })
        return totalItem
    }
}

module.exports = AuthSchemeService
