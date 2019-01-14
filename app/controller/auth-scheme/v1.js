/**
 * Created by yuliang on 2018/3/27.
 * 资源对外引用策略相关restful API
 */

'use strict';

const Controller = require('egg').Controller;
const statementAndBubbleSchema = require('../../extend/json-schema/statement-bubble-schema')
const batchOperationPolicySchema = require('../../extend/json-schema/batch-operation-policy-schema')

module.exports = class PolicyController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.authSchemeProvider = app.dal.authSchemeProvider
    }

    /**
     * 获取policyList
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        const authSchemeIds = ctx.checkQuery('authSchemeIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 50).value
        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitResourceId().toSplitArray().len(1, 50).value
        const authSchemeStatus = ctx.checkQuery('authSchemeStatus').optional().toInt().in([0, 1, 4]).value
        const policyStatus = ctx.checkQuery('policyStatus').default(1).optional().toInt().in([0, 1, 2]).value
        const projection = ctx.checkQuery('projection').optional().toSplitArray().value

        ctx.validate()

        if (authSchemeIds === undefined && resourceIds === undefined) {
            ctx.error({msg: '接口最少需要一个有效参数'})
        }

        var projectionStr = null
        if (projection && projection.length) {
            projectionStr = projection.join(' ')
        }

        await ctx.service.authSchemeService.findAuthSchemeList({
            authSchemeIds,
            resourceIds,
            authSchemeStatus,
            policyStatus,
            projection: projectionStr
        }).then(ctx.success)
    }

    /**
     * 展示资源的引用策略
     * @param ctx
     * @returns {Promise.<void>}
     */
    async show(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value
        const policyStatus = ctx.checkQuery('policyStatus').default(1).optional().toInt().in([0, 1, 2]).value

        ctx.validate()

        const authSchemeInfo = await this.authSchemeProvider.findById(authSchemeId)
        if (policyStatus === 0 || policyStatus === 1) {
            authSchemeInfo.policy = authSchemeInfo.policy.filter(x => x.status === policyStatus)
        }

        ctx.success(authSchemeInfo)
    }

    /**
     * 创建资源的引用策略
     * @param ctx
     * @returns {Promise.<void>}
     */
    async create(ctx) {

        const resourceId = ctx.checkBody('resourceId').isResourceId().value
        const authSchemeName = ctx.checkBody('authSchemeName').type("string").len(2, 100).trim().value
        ctx.allowContentType({type: 'json'}).validate()

        const {userId} = ctx.request
        const resourceInfo = await ctx.dal.resourceProvider.findOne({resourceId, userId})
        if (!resourceInfo) {
            ctx.error({msg: 'resourceId错误或者没有权限'})
        }

        await this.authSchemeProvider.count({resourceId}).then(count => {
            count >= 20 && ctx.error({msg: '同一个资源最多只能创建20个授权方案'})
        })

        resourceInfo.systemMeta.dependencies = resourceInfo.systemMeta.dependencies || []

        const authScheme = {
            policy: [], userId,
            resourceId: resourceInfo.resourceId,
            authSchemeName, dutyStatements: [], bubbleResources: [],
            dependCount: resourceInfo.systemMeta.dependCount || resourceInfo.systemMeta.dependencies.length,
        }

        await this.authSchemeProvider.create(authScheme).then(ctx.success)
    }

    /**
     * 处理上抛与声明,并签约
     * @param ctx
     * @returns {Promise<void>}
     */
    async batchSignContracts(ctx) {

        const authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('authSchemeId格式错误').value
        const dutyStatements = ctx.checkBody('dutyStatements').exist().isArray().len(0, 200).value
        const bubbleResources = ctx.checkBody('bubbleResources').exist().isArray().len(0, 200).value
        ctx.validate()

        let authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }
        if (!authScheme.dependCount) {
            ctx.error({msg: '授权方案的主体资源不存在依赖项,无法签约', data: {authScheme}})
        }
        //后期可以考虑处理不改动上抛的情况下,只重新选择同一方案下的策略.目前下游授权树已经生成,上游授权方案不能随意变动
        if (authScheme.dutyStatements.length || authScheme.bubbleResources.length) {
            ctx.error({msg: '授权方案签约完成以后暂不允许变动', data: {authScheme}})
        }

        const dutyStatementValidateResult = statementAndBubbleSchema.validate(dutyStatements, statementAndBubbleSchema.dutyStatementsValidator)
        if (dutyStatementValidateResult.errors.length) {
            ctx.error({msg: '参数dutyStatements格式校验失败', data: dutyStatementValidateResult.errors})
        }
        const bubbleResourceValidateResult = statementAndBubbleSchema.validate(bubbleResources, statementAndBubbleSchema.bubbleResourcesValidator)
        if (bubbleResourceValidateResult.errors.length) {
            ctx.error({msg: '参数bubbleResources格式校验失败', data: bubbleResourceValidateResult.errors})
        }

        authScheme = authScheme.toObject()
        authScheme.dutyStatements = dutyStatements
        authScheme.bubbleResources = bubbleResources

        await ctx.service.authSchemeService.batchSignContracts(authScheme).then(ctx.success)
    }

    /**
     * 更新资源的引用策略
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value
        const authSchemeName = ctx.checkBody('authSchemeName').optional().type("string").len(2, 100).trim().value
        const policies = ctx.checkBody('policies').optional().value //base64编码之后的字符串
        const isOnline = ctx.checkBody('isOnline').optional().toInt().in([0, 1]).value

        ctx.allowContentType({type: 'json'}).validate()

        if ([authSchemeName, policies, isOnline].every(x => x === undefined)) {
            ctx.error({msg: "最少需要一个有效参数"})
        }

        if (policies) {
            const result = batchOperationPolicySchema.validate(policies, batchOperationPolicySchema.authSchemePolicyValidator)
            result.errors.length && ctx.error({msg: '参数policies格式校验失败', data: result.errors})
        }

        let authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }

        await ctx.service.authSchemeService.updateAuthScheme({
            authScheme: authScheme.toObject(), authSchemeName, policies, isOnline
        }).then(ctx.success)
    }

    /**
     * 授权点关联的合同信息
     * @param ctx
     * @returns {Promise<void>}
     */
    async associatedContracts(ctx) {

        const authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('authSchemeId格式错误').value
        const contractStatus = ctx.checkQuery('contractStatus').optional().toInt().in([1, 2, 3]).value
        ctx.validate()

        const authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: {userId: ctx.request.userId}})
        }

        const contractIds = authScheme.associatedContracts.map(x => x.contractId)
        if (!contractIds.length) {
            return ctx.success([])
        }

        var contractInfos = await ctx.curlIntranetApi(`${ctx.webApi.contractInfo}/list?contractIds=${contractIds.toString()}`)
        if (contractStatus) {
            contractInfos = contractInfos.filter(x => x.status === contractStatus)
        }
        ctx.success(contractInfos)
    }

    /**
     * 授权方案的授权树
     * @param ctx
     * @returns {Promise<void>}
     */
    async schemeAuthTree(ctx) {

        const authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('authSchemeId格式错误').value
        ctx.validate()

        const authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.status !== 1) {
            ctx.error({msg: "未找到授权方案或者授权方案还未启用", data: {authScheme}})
        }

        var authTree = await ctx.dal.schemeAuthTreeProvider.findOne({authSchemeId})
        if (!authTree && authScheme.associatedContracts.length) {
            authTree = await ctx.service.authSchemeService.updateAuthScheme(authScheme)
        } else if (!authTree) {
            authTree = {authSchemeId, resourceId: authScheme.resourceId, authTree: [], status: 0}
        }

        ctx.success(authTree)
    }

    /**
     * 获取授权方案中所有的授权合同ID
     * @param ctx
     * @returns {Promise<void>}
     */
    async schemeAuthTreeContractIds(ctx) {

        const authSchemeIds = ctx.checkQuery('authSchemeIds').isSplitMongoObjectId().toSplitArray().value
        ctx.validate()

        const contracts = await ctx.dal.schemeAuthTreeProvider.find({_id: {$in: authSchemeIds}})

        ctx.success(contracts)
    }
}