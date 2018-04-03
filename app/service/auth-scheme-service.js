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

        let authScheme = {
            authSchemeName, languageType, policyText, dependStatements,
            resourceId: resourceInfo.resourceId,
            serialNumber: app.mongoose.getNewObjectId(),
            policy: policySegments,
            userId: ctx.request.userId
        }

        //校验数据与构建model
        await this._checkStatementAndBuild({authScheme, resourceInfo, dependStatements})

        return ctx.dal.authSchemeProvider.create(authScheme)
    }

    /**
     * 更新授权方案
     * @returns {Promise<void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policyText, dependStatements, status}) {

        let {ctx} = this
        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authScheme.resourceId})

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

            //校验数据与构建model
            await this._checkStatementAndBuild({authScheme, resourceInfo, dependStatements})

            model.dependStatements = dependStatements
            model.contractCoverageRate = authScheme.contractCoverageRate
            model.statementCoverageRate = authScheme.statementCoverageRate
            model.statementState = authScheme.statementState
            model.bubbleResources = authScheme.bubbleResources
            model.dependCount = authScheme.dependCount
        }

        return ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 管理申明的依赖之间的合约
     * @returns {Promise<void>}
     */
    async manageDependStatementContract({authScheme, dependStatements}) {

        let {ctx, app} = this
        let effectiveStatements = dependStatements.filter(param => {
            let depend = authScheme.dependStatements.find(item => param.resourceOneId === item.resourceOneId && param.resourceTwoId === item.resourceTwoId && param.deep === item.deep)
            if (depend) {
                depend.contractId = param.contractId || ""
            }
            return depend ? true : false
        })

        if (effectiveStatements.length !== dependStatements.length) {
            ctx.error({
                msg: "参数dependStatements数据校验失败,授权点声明的依赖与传入参数不匹配",
                data: {effectiveStatements},
                errCode: app.errCodeEnum.paramValidateError
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

        return ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 检查声明数据与计算授权点属性
     * @private
     */
    async _checkStatementAndBuild({authScheme, resourceInfo, dependStatements}) {

        this._checkRepeatedStatements({dependStatements})

        let {ctx} = this
        let resourceDependencies = await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies || [])
        let resourceDependencyKeys = this._getTreeNodes(resourceDependencies, resourceInfo.resourceId)

        this._checkStatementResource({dependStatements, resourceDependencies, resourceDependencyKeys})
        await this._checkStatementContract({dependStatements})

        authScheme.bubbleResources = resourceDependencyKeys.reduce((accumulator, current) => {
            if (!dependStatements.some(treeNodeComparer(current))) {
                let base = accumulator.find(item => item.resourceId === current.resourceOneId && item.deep === current.deep)
                if (!base) {
                    base = {
                        resourceId: current.resourceOneId,
                        deep: current.deep,
                        dependencies: [{resourceId: current.resourceTwoId}]
                    }
                    accumulator.push(base)
                } else {
                    base.dependencies.push({resourceId: current.resourceTwoId})
                }
            }
            return accumulator
        }, [])

        authScheme.dependCount = resourceDependencyKeys.length

        this._calculateCoverageRate({authScheme})

        return authScheme
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

        let statistics = authScheme.dependStatements.reduce((accumulator, current) => {
            accumulator.dependCount += current.dependencies.length
            accumulator.signContractCount += current.dependencies.filter(item => commonRegex.mongoObjectId.test(item.contractId)).length
            return accumulator
        }, {signContractCount: 0, dependCount: 0})

        authScheme.statementCoverageRate = (statistics.dependCount / authScheme.dependCount).toFixed(4) * 100
        authScheme.contractCoverageRate = (statistics.signContractCount / statistics.dependCount).toFixed(4) * 100
        authScheme.statementState = authScheme.statementCoverageRate === 0 ? 1 : authScheme.statementCoverageRate === 100 ? 2 : 3

        return authScheme
    }

    /**
     * 检查申明的资源是否是依赖的资源树上的节点
     * @param dependStatements
     * @param resourceDependencies
     * @param resourceDependencyKeys
     * @returns {boolean}
     * @private
     */
    _checkStatementResource({dependStatements, resourceDependencies, resourceDependencyKeys}) {

        if (!dependStatements || !dependStatements.length) {
            return true
        }

        let {ctx} = this

        //如果有声明依赖,但是资源本身没有依赖关系,则属于无效声明
        if (!resourceDependencies.length) {
            ctx.error({msg: '声明依赖数据错误', data: {dependStatements, resourceDependencies}})
        }

        dependStatements.forEach(item => {
            item.dependencies.forEach(m => {
                if (!resourceDependencyKeys.some(depend => depend.deep === item.deep && depend.resourceOneId === item.resourceId && depend.resourceTwoId === m.resourceId)) {
                    ctx.error({msg: '声明依赖的资源不存在于资源的依赖树中', data: {item, member: m, resourceDependencyKeys}})
                }
            })
        })
        return true
    }


    /**
     * 检查重复的依赖申明
     * @param dependStatements
     * @returns {boolean}
     * @private
     */
    _checkRepeatedStatements({dependStatements}) {
        if (!Array.isArray(dependStatements)) {
            return true
        }
        let distinctDependStatements = [...new Set(dependStatements.map(item => `${item.deep}_${item.resourceId}`))]
        if (distinctDependStatements.length !== dependStatements.length) {
            this.ctx.error({msg: '声明依赖数据错误,不允许出现重复的节点', data: {dependStatements}})
        }
        dependStatements.forEach(item => {
            if ([...new Set(item.dependencies.map(m => m.resourceId))].length !== item.dependencies.length) {
                this.ctx.error({msg: '声明依赖数据错误,不允许出现重复的节点', data: {item}})
            }
        })
        return true
    }

    /**
     * 校验授权点中申明的资源与绑定的合同是否合法
     * @param dependStatements
     * @returns {Promise<void>}
     */
    async _checkStatementContract({dependStatements}) {

        let hasContractStatements = dependStatements.reduce((accumulator, current) => {
            return [...accumulator, ...current.dependencies.filter(item => commonRegex.mongoObjectId.test(item.contractId))]
        }, [])

        if (!hasContractStatements.length) {
            return true
        }

        let {ctx, config} = this
        let contractUrl = `${config.gatewayUrl}${config.env === 'local' ? '' : '/api/'}/v1/contracts/contractRecords?resourceIds=${hasContractStatements.map(item => item.resourceId).toString()}&contractIds=${hasContractStatements.map(item => item.contractId).toString()}&partyTwo=${ctx.request.userId}&contractType=1`
        let contractRecords = await ctx.curlIntranetApi(contractUrl)

        hasContractStatements.forEach(item => {
            let checkResult = contractRecords.some(contract => item.contractId == contract.contractId && item.resourceId === contract.resourceId)
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
    _getTreeNodes(treeList, resourceOneId, keyList = [], index = 0) {
        if (!Array.isArray(treeList) || !treeList.length) {
            return keyList
        }
        index++;
        treeList.reduce((accumulator, current) => {
            keyList.push({deep: index, resourceOneId, resourceTwoId: current.resourceId})
            return keyList.concat(this._getTreeNodes(current.dependencies || [], current.resourceId, keyList, index))
        }, keyList)
        return keyList
    }
}

const treeNodeComparer = (target) => {
    return item => item.deep === target.deep
        && item.resourceId === target.resourceOneId
        && item.dependencies.some(m => m.resourceId === target.resourceTwoId)
}

module.exports = AuthSchemeService

