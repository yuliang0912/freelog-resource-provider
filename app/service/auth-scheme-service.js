'use strict'

const Service = require('egg').Service
const lodash = require('lodash')
const policyParse = require('../extend/helper/policy_parse_factory')

class AuthSchemeService extends Service {

    /**
     * 创建授权点
     * @returns {Promise<void>}
     */
    async createAuthScheme({authSchemeName, resourceInfo, policyText, languageType, dutyStatements, isPublish}) {

        const {app, ctx} = this;

        let authScheme = {
            authSchemeName, languageType,
            dutyStatements: [],
            dependCount: 0,
            resourceId: resourceInfo.resourceId,
            serialNumber: app.mongoose.getNewObjectId(),
            userId: ctx.request.userId,
            policy: [],
            status: 0
        }

        if (policyText) {
            authScheme.policyText = policyText
            authScheme.policy = policyParse.parse(policyText, languageType)
        }

        if (isPublish && (authScheme.policy.length === 0 || dutyStatements.length > 0)) {
            ctx.error({
                msg: "当前状态无法直接发布",
                data: {policyCount: authScheme.policy.length, dutyStatementCount: dutyStatements.length}
            })
        }

        if (isPublish) {
            authScheme.status = 1
        }

        resourceInfo.systemMeta.dependencies = resourceInfo.systemMeta.dependencies || []
        authScheme.dutyStatements = await this._perfectDutyStatements({authScheme, resourceInfo, dutyStatements})

        return ctx.dal.authSchemeProvider.create(authScheme)
    }

    /**
     * 更新授权方案
     * @returns {Promise<void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policyText, dutyStatements}) {

        const {ctx} = this
        const model = {authSchemeName: authSchemeName || authScheme.authSchemeName}

        if (policyText) {
            model.serialNumber = this.app.mongoose.getNewObjectId()
            model.policy = policyParse.parse(policyText, authScheme.languageType)
            model.policyText = policyText
        }

        if (Array.isArray(dutyStatements)) {
            if (dutyStatements.length) {
                const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
                model.dutyStatements = await this._perfectDutyStatements({authScheme, resourceInfo, dutyStatements})
            }
            model.dutyStatements = dutyStatements
        }

        return ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 完善与校验责任声明数据
     * @param resourceInfo
     * @param dutyStatements
     * @returns {Promise<void>}
     * @private
     */
    async _perfectDutyStatements({authScheme, resourceInfo, dutyStatements}) {

        const {ctx} = this

        if (!dutyStatements.length) {
            return []
        }

        const resourceDependencies = [{
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            dependencies: await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies || [])
        }]

        //TODO:依赖的数量应该体现到资源层面上.授权点只需要做一冗余即可.
        //authScheme.dependCount = this._getTreeNodeCount(resourceDependencies) - 1

        if (!dutyStatements.length) {
            return []
        }

        const buildStatements = this._validateDependencyStatements(resourceInfo, dutyStatements, resourceDependencies)
        if (buildStatements.length !== dutyStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,请检查是否有重复的资源声明', data: {dutyStatements}
            })
        }

        const validateFailedStatements = buildStatements.filter(item => !item.validate)
        if (validateFailedStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,请检查依赖链是否完整', data: validateFailedStatements
            })
        }

        await this._validateAuthSchemeAndPolicy(authScheme, resourceInfo, dutyStatements)

        return buildStatements
    }


    /**
     * 校验声明的数据是否在依赖树上
     * @param statementMaps
     * @param resourceTree
     * @private
     */
    _validateDependencyStatements(resourceInfo, dutyStatements, resourceDependencies) {

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
                statementMaps.get(node.resourceId).validate = !!(parent && parent.validate)
                recursion(item.dependencies, statementMaps)
            }))
        }

        recursion(resourceDependencies, statementMaps)

        statementMaps.delete(resourceInfo.resourceId)

        return [...statementMaps.values()]
    }

    /**
     * 验证资源的授权点与策略选择是否正确
     * @returns {Promise<void>}
     * @private
     */
    async _validateAuthSchemeAndPolicy(authScheme, resourceInfo, dutyStatements) {

        const {ctx} = this
        const authSchemeIds = dutyStatements.map(item => item.authSchemeId)

        const authSchemeInfos = await ctx.dal.authSchemeProvider.find({_id: {$in: authSchemeIds}})
        if (authSchemeIds.length !== authSchemeInfos.length) {
            ctx.error({
                msg: '参数dutyStatements中授权点数据校验失败',
                data: {
                    dutyStatements,
                    authSchemeInfos: authSchemeInfos.map(x => new Object({
                        resourceId: x.resourceId,
                        authSchemeId: x._id.toString()
                    }))
                }
            })
        }

        const authSchemeInfoMaps = new Map(authSchemeInfos.map(item => [item._id.toString(), item]))
        const validateFailedStatements = dutyStatements.filter(statement => {
            let authScheme = statement.authSchemeInfo = authSchemeInfoMaps.get(statement.authSchemeId)
            return !authScheme || authScheme.resourceId !== statement.resourceId
                || !authScheme.policy.some(x => x.segmentId === statement.policySegmentId)
        })
        if (validateFailedStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,请检查resourceId与authSchemeId,policySegmentId是否匹配',
                data: validateFailedStatements
            })
        }

        const statistics = authSchemeInfos.reduce((acc, current) => {
            acc.dependCount += current.dependCount
            acc.mergedBubbleResourceIds = [...acc.mergedBubbleResourceIds, ...current.bubbleResourceIds]
            return acc
        }, {mergedBubbleResourceIds: [], dependCount: 0})


        //上抛的资源为依赖的以及声明解决的资源上抛的合集 然后去除自己解决掉的
        const allBubbleResourceIds = this._distinctAndExclude(statistics.mergedBubbleResourceIds.concat(resourceInfo.systemMeta.dependencies.map(x => x.resourceId)))
        const invalidStatements = lodash.difference(dutyStatements.map(item => item.resourceId), allBubbleResourceIds)
        if (invalidStatements.length) {
            ctx.error({
                msg: 'dutyStatements数据校验失败,存在无效的声明',
                data: {
                    invalidStatements,
                    mergedBubbleResources: this._distinctAndExclude(statistics.mergedBubbleResourceIds)
                }
            })
        }

        authScheme.bubbleResourceIds = lodash.difference(allBubbleResourceIds, dutyStatements.map(item => item.resourceId))

        resourceInfo.dependCount - statistics.dependCount

        return dutyStatements
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

        //authScheme.bubbleResourceIds


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
