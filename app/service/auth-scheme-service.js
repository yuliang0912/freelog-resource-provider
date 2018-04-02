'use strict'

const Service = require('egg').Service
const policyParse = require('../extend/helper/policy_parse_factory')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

class AuthSchemeService extends Service {

    /**
     * 创建授权方案
     * @param resourceId
     * @param policyText
     * @param languageType
     * @returns {Promise<void>}
     */
    async createAuthScheme({authSchemeName, resourceInfo, policyText, languageType, dependStatements}) {

        let {app, ctx} = this;
        let policySegments = policyParse.parse(policyText, languageType)
        let resourceDependencies = await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies || [])

        await this._checkStatementResource({dependStatements, resourceInfo, resourceDependencies})

        let authScheme = {
            authSchemeName, languageType, policyText, dependStatements,
            resourceId: resourceInfo.resourceId,
            dependCount: this._getTreeNodeCount(resourceDependencies),
            serialNumber: app.mongoose.getNewObjectId(),
            policy: policySegments,
            userId: ctx.request.userId
        }

        //计算覆盖率与覆盖状态
        this._calculateCoverageRate({authScheme})

        return ctx.dal.authSchemeProvider.create(authScheme)
    }

    /**
     * 更新授权方案
     * @returns {Promise<void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policyText, dependStatements, status}) {

        let {ctx} = this
        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})
        let resourceDependencies = await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies || [])

        await this._checkStatementResource({dependStatements, resourceInfo, resourceDependencies})

        let model = {
            serialNumber: this.app.mongoose.getNewObjectId(),
            authSchemeName: authSchemeName || authScheme.authSchemeName
        }
        if (status !== undefined) {
            model.status = status
        }
        if (policyText) {
            model.policy = policyParse.parse(policyText, authScheme.languageType)
        }
        //如果不改动:undifined  设置为空:[],所以不是undifined时.需要重新计算覆盖率
        if (Array.isArray(dependStatements)) {
            authScheme.dependStatements = dependStatements
            this._calculateCoverageRate({authScheme})
            model.dependStatements = dependStatements
            model.contractCoverageRate = authScheme.contractCoverageRate
            model.statementCoverageRate = authScheme.statementCoverageRate
            model.statementState = authScheme.statementState
        }

        return ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 管理申明的依赖之间的合约
     * @returns {Promise<void>}
     */
    async manageDependStatementContract({authScheme, dependStatements}) {

        let effectiveStatements = []  //筛选有效申明
        authScheme.dependStatements.forEach(item => {
            dependStatements.forEach(param => {
                if (param.resourceOneId === item.resourceOneId && param.resourceTwoId === item.resourceTwoId && param.deep === item.deep) {
                    item.contractId = param.contractId || ""
                    effectiveStatements.push(param)
                }
            })
        })

        if (effectiveStatements.length !== dependStatements.length) {
            this.ctx.error({
                msg: "参数dependStatements数据校验失败,授权点声明的依赖与传入参数不匹配",
                errCode: ctx.app.errCodeEnum.paramValidateError
            })
        }

        this._checkRepeatedStatements({dependStatements})
        await this._checkStatementContract({dependStatements: effectiveStatements})
        this._calculateCoverageRate({authScheme})

        let model = {
            dependStatements: authScheme.dependStatements,
            contractCoverageRate: authScheme.contractCoverageRate,
            statementState: authScheme.statementState
        }

        return this.ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 计算覆盖率
     * @private
     */
    _calculateCoverageRate({authScheme}) {

        authScheme.dependStatements = authScheme.dependStatements || []

        if (authScheme.dependCount === 0) {
            authScheme.contractCoverageRate = 100
            authScheme.statementCoverageRate = 100
            authScheme.statementState = 2 //单一资源,则全包含
            return authScheme
        }

        if (authScheme.dependStatements.length === 0) {
            authScheme.contractCoverageRate = 0
            authScheme.statementCoverageRate = 0
            authScheme.statementState = 1 //复合资源,没声明引用,则全上抛
            return authScheme
        }

        let signContractCount = authScheme.dependStatements.filter(t => commonRegex.mongoObjectId.test(t.contractId)).length
        authScheme.statementCoverageRate = (authScheme.dependStatements.length / authScheme.dependCount).toFixed(4) * 100
        authScheme.contractCoverageRate = (signContractCount / authScheme.dependStatements.length).toFixed(4) * 100
        authScheme.statementState = authScheme.statementCoverageRate === 0 ? 1 : authScheme.statementCoverageRate === 100 ? 2 : 3

        return authScheme
    }

    /**
     * 检查申明的资源是否是依赖的资源树上的节点
     * @param dependStatements
     * @param resourceDependencies
     * @returns {Promise<void>}
     */
    _checkStatementResource({resourceInfo, dependStatements, resourceDependencies}) {

        if (!dependStatements || !dependStatements.length) {
            return true
        }

        this._checkRepeatedStatements({dependStatements})

        //如果有声明依赖,但是资源本身没有依赖关系,则属于无效声明
        if (!resourceDependencies.length) {
            this.ctx.error({msg: '声明依赖数据错误', data: {dependStatements, resourceDependencies}})
        }

        let resourceDependencyKeys = this._getTreeNodeKey(resourceDependencies, resourceInfo.resourceId)

        dependStatements.forEach(item => {
            let checkResult = resourceDependencyKeys.some(node => node === `deep_${item.deep}_${item.resourceOneId}_${item.resourceTwoId}`)
            !checkResult && this.ctx.error({msg: '声明依赖的资源不存在于资源的依赖树中', data: {item, resourceDependencies}})
        })

        return this._checkStatementContract({dependStatements})
    }


    /**
     * 检查重复的依赖申明
     * @param dependStatements
     * @returns {Promise<boolean>}
     * @private
     */
    _checkRepeatedStatements({dependStatements}) {
        let distinctDependStatements = [...new Set(dependStatements.map(item => `${item.deep}_${item.resourceOneId}_${item.resourceTwoId}`))]
        if (distinctDependStatements.length !== dependStatements.length) {
            this.ctx.error({msg: '声明依赖数据错误,不允许出现重复的节点', data: {dependStatements}})
        }
        return true
    }

    /**
     * 校验授权点中申明的资源与绑定的合同是否合法
     * @param dependStatements
     * @returns {Promise<void>}
     */
    async _checkStatementContract({dependStatements}) {
        let hasContractStatements = dependStatements.filter(item => commonRegex.mongoObjectId.test(item.contractId))
        if (!hasContractStatements.length) {
            return true
        }

        let {ctx, config} = this
        let contractUrl = `${config.gatewayUrl}${config.env === 'local' ? '' : '/api/'}/v1/contracts/contractRecords?resourceIds=${hasContractStatements.map(item => item.resourceTwoId).toString()}&contractIds=${hasContractStatements.map(item => item.contractId).toString()}&partyTwo=${ctx.request.userId}&contractType=1`
        let contractRecords = await ctx.curlIntranetApi(contractUrl)

        hasContractStatements.forEach(item => {
            let checkResult = contractRecords.some(contract => item.contractId == contract.contractId && item.resourceTwoId === contract.resourceId)
            !checkResult && ctx.error({msg: "声明依赖中绑定的合同校验失败", data: item})
        })

        return true
    }

    /**
     * 获取tree节点的数量
     * @param treeList
     * @param totalItem
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
     * 获取tree节点的每条线路组合key
     * @param treeList
     * @param resourceOneId
     * @param keyList
     * @param index
     * @private
     */
    _getTreeNodeKey(treeList, resourceOneId, keyList = [], index = 0) {
        if (!Array.isArray(treeList) || !treeList.length) {
            return keyList
        }
        index++;
        let mapResult = treeList.map(item => {
            return `deep_${index}_${resourceOneId}_${item.resourceId}`
        })
        keyList = keyList.concat(mapResult)
        treeList.forEach(item => {
            keyList = this._getTreeNodeKey(item.dependencies || [], item.resourceId, keyList, index)
        })
        return keyList
    }
}


module.exports = AuthSchemeService

