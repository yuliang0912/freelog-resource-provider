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
    findAuthSchemeList({authSchemeIds, resourceIds, authSchemeStatus, policyStatus, projection}) {

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

        return this.authSchemeProvider.find(condition, projection).then(dataList => this._filterPolicyStatus(dataList, policyStatus))
    }

    /**
     * 授权方案批量签约
     * @param authScheme
     * @returns {Promise<*>}
     * @constructor
     */
    async batchSignContracts(authScheme) {

        const {ctx, app, resourceProvider, schemeAuthTreeProvider} = this
        const resourceInfo = await resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})

        const untreatedResources = await this._checkStatementAndBubble({authScheme, resourceInfo})
        if (untreatedResources.length) {
            throw new LogicError('声明与上抛的数据不全,无法发布', {untreatedResources})
        }
        //如果没有声明数据,则表示全部上抛
        if (!authScheme.dutyStatements.length) {
            return this.authSchemeProvider.findOneAndUpdate({_id: authScheme.authSchemeId}, {bubbleResources: authScheme.bubbleResources}, {new: true})
        }

        const dutyStatementMap = new Map(authScheme.dutyStatements.map(x => [x.authSchemeId, x]))
        const contracts = await ctx.curlIntranetApi(`${ctx.webApi.contractInfo}/batchCreateAuthSchemeContracts`, {
            method: 'post', contentType: 'json', dataType: 'json',
            data: {
                partyTwo: authScheme.authSchemeId,
                contractType: app.contractType.ResourceToResource,
                signObjects: authScheme.dutyStatements.map(x => new Object({
                    targetId: x.authSchemeId,
                    segmentId: x.policySegmentId
                }))
            }
        })

        contracts.forEach(x => dutyStatementMap.get(x.targetId).contractId = x.contractId)

        const associatedContracts = contracts.map(x => new Object({
            authSchemeId: x.targetId,
            contractId: x.contractId
        }))

        return this.authSchemeProvider.findOneAndUpdate({_id: authScheme.authSchemeId}, {
            associatedContracts,
            bubbleResources: authScheme.bubbleResources,
            dutyStatements: Array.from(dutyStatementMap.values())
        }, {new: true})
    }

    /**
     * 更新授权方案
     * @param authScheme
     * @param authSchemeName
     * @param policies
     * @param isOnline
     * @returns {Promise<Promise<void>|IDBRequest|void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policies, isOnline}) {

        const {authSchemeProvider} = this
        const model = {authSchemeName: authSchemeName || authScheme.authSchemeName}

        //以下4个if不能随意变更位置和调整
        if (lodash.isInteger(isOnline)) {
            model.status = authScheme.status = isOnline ? 1 : 0
        }
        if (isOnline === 0) {
            const result = await this._offlineCheck(authScheme.authSchemeId, authScheme.resourceId)
            if (!result) {
                throw new ApplicationError('已上架的资源最少需要一个启用的授权方案')
            }
            model.status = authScheme.status = 0
        }
        if (policies) {
            model.policy = authScheme.policy = this._policiesHandler({authScheme, policies})
            if (authScheme.status === 1 && !authScheme.policy.some(x => x.status === 1)) {
                throw new ApplicationError('已启用的授权方案最少需要一个有效的授权策略')
            }
        }
        if (isOnline === 1) {
            if (authScheme.dependCount > 0 && !authScheme.dutyStatements.length && !authScheme.bubbleResources.length) {
                throw new ApplicationError('授权方案暂未处理依赖资源,无法启用上线')
            }
            if (!authScheme.policy.some(x => x.status === 1)) {
                throw new ApplicationError('授权方案缺少有效的授权策略,无法启用上线')
            }
            model.status = authScheme.status = 1
        }

        return authSchemeProvider.findOneAndUpdate({_id: authScheme.authSchemeId}, model, {new: true}).then(model => {
            if (policies !== undefined || isOnline !== undefined) {
                this.app.emit(authSchemeEvents.authPolicyModifyEvent, {authScheme: model})
            }
            return model
        })
    }

    /**
     * 构建授权方案的授权树
     * @param presentable
     * @private
     */
    async updateSchemeAuthTree(authScheme) {

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

        //声明处理的数据中,引用的授权方案存在,资源主体一致并且启用.引用的策略存在并且上线
        const validateFailedStatements = dutyStatements.filter(statement => {
            const authScheme = statement.authSchemeInfo = authSchemeInfoMap.get(statement.authSchemeId)
            return !authScheme || authScheme.resourceId !== statement.resourceId || authScheme.status !== 1
                || !authScheme.policy.some(x => x.segmentId === statement.policySegmentId && x.status === 1)
        })
        if (validateFailedStatements.length) {
            throw new ApplicationError('dutyStatements数据校验失败,请检查resourceId与authSchemeId,policySegmentId以及他们的状态是否符合条件', validateFailedStatements)
        }

        const untreatedResources = []
        const recursion = (resources) => resources.forEach(({resourceId, resourceName}) => {
            let dutyStatement = dutyStatementMap.get(resourceId)
            let bubbleResource = bubbleResourceMap.get(resourceId)
            if (bubbleResource) {
                bubbleResource.validate = true
                bubbleResource.resourceName = resourceName === undefined ? '' : resourceName
            }
            else if (dutyStatement) {
                dutyStatement.validate = true
                dutyStatement.resourceName = resourceName === undefined ? '' : resourceName
                recursion(authSchemeInfoMap.get(dutyStatement.authSchemeId).bubbleResources)
            }
            else {
                untreatedResources.push(...arguments)
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
     * 过滤掉指定的授权状态
     * @param dataList
     * @param policyStatus
     * @returns {Promise<void>}
     * @private
     */
    _filterPolicyStatus(dataList, policyStatus) {

        if (Array.isArray(dataList) && (policyStatus === 1 || policyStatus === 0)) {
            dataList.forEach(item => {
                if (item.policy) {
                    item.policy = item.policy.filter(x => x.status === policyStatus)
                }
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

    /**
     * 下线检测
     * @param authSchemeId
     * @param resourceId
     * @private
     */
    async _offlineCheck(authSchemeId, resourceId) {
        const isExistOnlineAuthScheme = await this.authSchemeProvider.count({
            resourceId, status: 1, _id: {$ne: authSchemeId}
        })
        if (isExistOnlineAuthScheme) {
            return true
        }
        const resourceInfo = await this.resourceProvider.findById(resourceId)

        return resourceInfo.status === 2 ? false : true
    }
}

module.exports = AuthSchemeService
