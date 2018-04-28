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
    async updateAuthScheme({authScheme, authSchemeName, policyText, status}) {

        let model = {
            authSchemeName: authSchemeName || authScheme.authSchemeName
        }
        if (status !== undefined) {
            model.status = status
        }
        if (policyText) {
            model.serialNumber = this.app.mongoose.getNewObjectId()
            model.policy = policyParse.parse(policyText, authScheme.languageType)
        }

        return this.ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 管理申明的依赖之间的合约
     * @returns {Promise<void>}
     */
    async manageDependStatementContract({authScheme, dependStatements}) {

        let {ctx, app} = this
        let effectiveStatements = dependStatements.filter(param => {
            let depend = authScheme.dependStatements.find(item => param.resourceId === item.resourceId && param.deep === item.deep)
            if (depend) {
                depend.dependencies
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

        //把依赖转换成扁平模式,方便快速操作
        dependStatements = this._buildFlatDependStatements(dependStatements)

        this._checkRepeatedStatements({dependStatements})

        let {ctx} = this
        let resourceDependencies = await ctx.service.resourceService.buildDependencyTree(resourceInfo.systemMeta.dependencies || [])
        let resourceDependencyKeys = this._getTreeNodes(resourceDependencies, resourceInfo.resourceId)

        this._checkStatementResource({dependStatements, resourceDependencies, resourceDependencyKeys})
        await this._checkStatementContract({dependStatements})

        let bubbleResources = resourceDependencyKeys.filter(item => !dependStatements.some(this._treeNodeCompare(item)))

        authScheme.bubbleResources = this._mergeDependStatements(bubbleResources)
        authScheme.dependStatements = this._mergeDependStatements(dependStatements)
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
            if (resourceDependencyKeys.some(this._treeNodeCompare(item))) {
                return
            }
            ctx.error({
                msg: '声明依赖的资源不存在于资源的依赖树中',
                data: {item: this._mergeDependStatements([item]), resourceDependencyKeys}
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

        let distinctDependStatements = [...new Set(dependStatements.map(item => `${item.deep}_${item.baseResourceId}_${item.resourceId}`))]
        if (distinctDependStatements.length !== dependStatements.length) {
            this.ctx.error({
                msg: '声明依赖数据错误,不允许出现重复的节点',
                data: {dependStatements: this._mergeDependStatements(dependStatements)}
            })
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
     * @param baseResourceId
     * @param keyList
     * @param index
     * @private
     */
    _getTreeNodes(treeList, baseResourceId, keyList = [], index = 0) {

        if (!Array.isArray(treeList) || !treeList.length) {
            return keyList
        }
        index++;
        treeList.reduce((accumulator, current) => {
            keyList.push({deep: index, baseResourceId, resourceId: current.resourceId})
            return keyList.concat(this._getTreeNodes(current.dependencies || [], current.resourceId, keyList, index))
        }, keyList)
        return keyList
    }

    /**
     * 把二层依赖树拍平为一层结构
     * @param dependencies
     * @private
     */
    _buildFlatDependStatements(dependStatements) {

        return dependStatements.reduce((accumulator, current) => {
            const dependencies = current.dependencies.map(item => {
                return {
                    baseResourceId: current.resourceId,
                    resourceId: item.resourceId,
                    contractId: item.contractId,
                    deep: current.deep
                }
            })
            return accumulator.concat(dependencies)
        }, []).sort(this._sortByDeepCompare)
    }

    /**
     * 把一层结构的依赖树合并成二层结构
     * @param dependStatements
     * @private
     */
    _mergeDependStatements(dependStatements) {

        return dependStatements.reduce((accumulator, current) => {
            let baseDeep = accumulator.find(item => item.resourceId === current.baseResourceId && item.deep === current.deep)
            if (!baseDeep) {
                baseDeep = {resourceId: current.baseResourceId, deep: current.deep, dependencies: []}
                accumulator.push(baseDeep)
            }
            baseDeep.dependencies.push({resourceId: current.resourceId, contractId: current.contractId})
            return accumulator
        }, []).sort(this._sortByDeepCompare)
    }

    /**
     * 根据deep排序的比较器
     * @param first
     * @param second
     * @private
     */
    _sortByDeepCompare(first, second) {
        return first.deep === second.deep ? 0 : first.deep < second.deep ? -1 : 1;
    }

    /**
     * 树上的节点比较器
     * @param target
     * @returns {function(*): boolean}
     * @private
     */
    _treeNodeCompare(target) {
        return item => item.deep === target.deep
            && item.resourceId === target.resourceId
            && item.baseResourceId === target.baseResourceId
    }
}

module.exports = AuthSchemeService

