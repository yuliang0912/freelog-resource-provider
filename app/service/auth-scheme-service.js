'use strict'

const Service = require('egg').Service
const lodash = require('lodash')

class AuthSchemeService extends Service {

    /**
     * 查找授权方案列表
     * @param authSchemeIds
     * @param resourceIds
     * @param authSchemeStatus
     * @param policyStatus
     * @returns {PromiseLike<T> | Promise<T>}
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

        return this.ctx.dal.authSchemeProvider.find(condition).then(dataList => this._filterPolicyStatus(dataList, policyStatus))
    }

    /**
     * 创建授权点
     * @returns {Promise<void>}
     */
    async createAuthScheme({authSchemeName, resourceInfo, policies, languageType, dutyStatements, bubbleResources, isPublish}) {

        const {ctx} = this

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
            ctx.error({
                msg: "当前状态无法直接发布,请检查是否存在有效策略,以及全部处理好依赖资源",
                data: {
                    policyCount: authScheme.policy.length,
                    dutyStatementsCount: dutyStatements.length,
                    untreatedResources
                }
            })
        }

        return ctx.dal.authSchemeProvider.create(authScheme).then(data => {
            authScheme.status == 1 && ctx.service.resourceService.updateResourceStatus(resourceInfo.resourceId, 2)
            return data
        })
    }

    /**
     * 更新授权方案
     * @returns {Promise<void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policies, dutyStatements, bubbleResources}) {

        const {ctx} = this
        const model = {authSchemeName: authSchemeName || authScheme.authSchemeName}

        if (policies) {
            model.policy = this._policiesHandler({authScheme, policies})
        }
        if (dutyStatements || bubbleResources) {
            authScheme.dutyStatements = dutyStatements || authScheme.dutyStatements
            authScheme.bubbleResources = bubbleResources || authScheme.bubbleResources
            const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
            await this._checkStatementAndBubble({authScheme, resourceInfo})
        }

        return ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 授权点批量签约
     * @returns {Promise<void>}
     */
    async batchSignContracts({authScheme}) {

        const {ctx, app} = this

        if (authScheme.status !== 0) {
            ctx.error({msg: '只有初始状态的授权方案才能发布', data: {currentStatus: authScheme.status}})
        }
        if (!authScheme.policy.length) {
            ctx.error({msg: '授权方案缺少策略,无法发布', data: {currentStatus: authScheme.status}})
        }

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
        const untreatedResources = await this._checkStatementAndBubble({authScheme, resourceInfo})
        if (untreatedResources.length) {
            ctx.error({msg: '声明与上抛的数据不全,无法发布', data: {untreatedResources}})
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
            }).catch(ctx.error)
        }

        contracts.forEach(x => dutyStatementMap.get(x.targetId).contractId = x.contractId)

        const associatedContracts = contracts.map(x => new Object({
            authSchemeId: x.targetId,
            contractId: x.contractId
        }))

        await ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, {
            status: 1,
            associatedContracts,
            dutyStatements: Array.from(dutyStatementMap.values()),
        }).then(() => ctx.service.resourceService.updateResourceStatus(authScheme.resourceId, 2))

        return contracts
    }

    /**
     * 删除授权方案
     * @param authSchemeId
     */
    async deleteAuthScheme(authSchemeId, resourceId) {

        const {ctx} = this
        await ctx.dal.authSchemeProvider.update({_id: authSchemeId}, {status: 4})
        const isExist = await this.isExistValidAuthScheme(resourceId)
        if (!isExist) {
            return ctx.service.resourceService.updateResourceStatus(resourceId, 1)
        }
        return true
    }

    /**
     * 检查是否存在有效的授权方案
     */
    isExistValidAuthScheme(resourceId) {
        return this.ctx.dal.authSchemeProvider.count({resourceId, status: 1}).then(count => count > 0)
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
     * 检查上抛和声明的数据是否在上抛树上,而且依赖关系正确
     * @returns {Promise<void>} 返回未处理的上抛(没声明也没显示上抛)
     * @private
     */
    async _checkStatementAndBubble({authScheme, resourceInfo}) {

        const {dutyStatements, bubbleResources} = authScheme
        const intersection = lodash.intersectionBy(dutyStatements, bubbleResources, 'resourceId')
        if (intersection.length) {
            ctx.error({msg: '声明与上抛的资源数据中存在交集', data: intersection})
        }

        const {ctx} = this
        const authSchemeIds = dutyStatements.map(item => item.authSchemeId)
        const dutyStatementMap = new Map(dutyStatements.map(x => [x.resourceId, x]))
        const bubbleResourceMap = new Map(bubbleResources.map(x => [x.resourceId, x]))
        const authSchemeInfoMap = await ctx.dal.authSchemeProvider.find({_id: {$in: authSchemeIds}}).then(dataList => {
            return new Map(dataList.map(x => [x._id.toString(), x]))
        })

        const validateFailedStatements = dutyStatements.filter(statement => {
            let authScheme = statement.authSchemeInfo = authSchemeInfoMap.get(statement.authSchemeId)
            return !authScheme || authScheme.resourceId !== statement.resourceId // || authScheme.status !== 1
                || !authScheme.policy.some(x => x.segmentId === statement.policySegmentId) // && x.status === 1)
        })
        if (validateFailedStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,请检查resourceId与authSchemeId,policySegmentId以及他们的状态是否符合条件',
                data: validateFailedStatements
            })
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

        recursion(resourceInfo.systemMeta.dependencies)

        const invalidStatements = dutyStatements.filter(x => !x.validate)
        if (invalidStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,存在无效的声明',
                data: {invalidStatements: invalidStatements.map(x => new Object({resourceId: x.resourceId}))}
            })
        }

        const invalidBubbleResources = bubbleResources.filter(x => !x.validate)
        if (invalidBubbleResources.length) {
            ctx.error({
                msg: 'bubbleResources中存在无效上抛',
                data: invalidBubbleResources
            })
        }

        return untreatedResources
    }

    /**
     * 检查声明和上抛资源信息是否完整
     * @param dutyStatements
     * @param resourceInfo
     * @param bubbleResources
     * @returns {Promise<void>}
     * @private
     */
    async _checkStatementAndBubble1({authScheme, resourceInfo, bubbleResources}) {

        var {ctx} = this
        var allBubbleResources = resourceInfo.systemMeta.dependencies.slice()

        const intersection = lodash.intersectionBy(authScheme.dutyStatements, bubbleResources, 'resourceId')
        if (intersection.length) {
            ctx.error({msg: '声明与上抛的资源数据中存在交集', data: intersection})
        }

        if (authScheme.__authSchemeList__) {
            authScheme.__authSchemeList__.forEach(item => allBubbleResources = allBubbleResources.concat(item.bubbleResources))
        } else {
            await ctx.dal.authSchemeProvider.find({_id: {$in: authScheme.dutyStatements.map(item => item.authSchemeId)}})
                .each(item => allBubbleResources = allBubbleResources.concat(item.bubbleResources))
        }

        //如果声明解决的资源不是其选择的授权方案的上抛资源的子集,则说明声明数据有误
        const invalidStatements = lodash.differenceBy(authScheme.dutyStatements, allBubbleResources, 'resourceId')
        if (invalidStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,存在无效的声明',
                data: {invalidStatements, allBubbleResources}
            })
        }

        //除开声明部分,剩余需要解决的
        const remainderBubbleResources = lodash.differenceBy(allBubbleResources, authScheme.dutyStatements, 'resourceId')
        const invalidBubbleResources = lodash.differenceBy(bubbleResources, remainderBubbleResources, 'resourceId')
        if (invalidBubbleResources.length) {
            ctx.error({
                msg: 'bubbleResources中存在无效上抛',
                data: invalidBubbleResources
            })
        }

        //未完全选择的资源(没有声明,也没有显示上抛)
        const noHandlerBubbleResources = lodash.differenceBy(remainderBubbleResources, bubbleResources, 'resourceId')

        return noHandlerBubbleResources
    }

    /**
     * 完善与校验责任声明数据
     * @param resourceInfo
     * @param dutyStatements
     * @returns {Promise<void>}
     * @private
     */
    async _perfectDutyStatements({authScheme, resourceInfo, dutyStatements}) {

        if (!dutyStatements.length) {
            return []
        }

        const {ctx} = this
        var allBubbleResources = resourceInfo.systemMeta.dependencies.slice()
        const authSchemeIds = dutyStatements.map(item => item.authSchemeId)
        const authSchemeList = await ctx.dal.authSchemeProvider.find({_id: {$in: authSchemeIds}})
        const authSchemeInfoMap = new Map(authSchemeList.map(item => [item._id.toString(), item]))

        const validateFailedStatements = dutyStatements.filter(statement => {
            let authScheme = statement.authSchemeInfo = authSchemeInfoMap.get(statement.authSchemeId)
            if (authScheme) {
                allBubbleResources = allBubbleResources.concat(authScheme.bubbleResources)
            }
            return !authScheme || authScheme.resourceId !== statement.resourceId // || authScheme.status !== 1
                || !authScheme.policy.some(x => x.segmentId === statement.policySegmentId) // && x.status === 1)
        })
        if (validateFailedStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,请检查resourceId与authSchemeId,policySegmentId是否匹配',
                data: validateFailedStatements
            })
        }

        const invalidStatements = lodash.differenceBy(dutyStatements, allBubbleResources, 'resourceId')
        if (invalidStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,存在无效的声明',
                data: {invalidStatements, allBubbleResources}
            })
        }

        authScheme.__authSchemeList__ = authSchemeList

        return this._validateDependencyStatements(resourceInfo, dutyStatements)
    }

    /**
     * 校验声明与上抛的数据在依赖树上是否完整
     * @param statementMaps
     * @param resourceTree
     * @private
     */
    async _validateDependency(resourceInfo, dutyStatements, bubbleResources) {

        const {ctx} = this
        const resourceDependencies = [{
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            dependencies: await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies)
        }]

        const statementMaps = dutyStatements.reduce((acc, current) => {
            return acc.set(current.resourceId, Object.assign({}, current))
        }, new Map([[resourceInfo.resourceId, {validate: true}]]))

        const recursion = (resourceTree, statementMaps) => {
            resourceTree.forEach(item => item.dependencies.forEach(node => {
                if (!statementMaps.has(node.resourceId)) {
                    return
                }
                //父级存在并且父级的依赖也存在,则表示依赖链完整
                let parent = statementMaps.get(item.resourceId)
                statementMaps.get(node.resourceId).validate = Boolean(parent && parent.validate)
                statementMaps.get(node.resourceId).resourceName = node.resourceName
                recursion(item.dependencies, statementMaps)
            }))
        }

        recursion(resourceDependencies, statementMaps)

        statementMaps.delete(resourceInfo.resourceId)

        const buildStatements = Array.from(statementMaps.values())
        if (buildStatements.length !== dutyStatements.length) {
            ctx.error({msg: 'dutyStatements数据校验失败,请检查是否有重复的资源声明', data: {dutyStatements}})
        }

        const validateFailedStatements = buildStatements.filter(item => !item.validate)
        if (validateFailedStatements.length) {
            ctx.error({msg: 'dutyStatements数据校验失败,请检查依赖链是否完整', data: validateFailedStatements})
        }

        return buildStatements
    }

    /**
     * 计算覆盖率
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
     * 比较两个带有资源ID实体是否同属一个资源对象
     * @param resourceA
     * @param resourceB
     * @returns {boolean}
     * @private
     */
    _isEqualResource(resourceA, resourceB) {
        return resourceA.resourceId === resourceB.resourceId
    }

    /**
     * 去重
     * @param resources
     * @returns {*}
     * @private
     */
    _sortedUniqResoure(resources) {
        return lodash.sortedUniqBy(resources, x => x.resourceId)
    }
}

module.exports = AuthSchemeService
