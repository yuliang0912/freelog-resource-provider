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

        ctx.validate()

        if (authSchemeIds === undefined && resourceIds === undefined) {
            ctx.error({msg: '接口最少需要一个有效参数'})
        }

        await ctx.service.authSchemeService.findAuthSchemeList({
            authSchemeIds,
            resourceIds,
            authSchemeStatus,
            policyStatus
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
        const policies = ctx.checkBody('policies').optional().value //base64编码之后的字符串
        const languageType = ctx.checkBody('languageType').optional().in(['freelog_policy_lang']).default('freelog_policy_lang').value
        const dutyStatements = ctx.checkBody('dutyStatements').optional().isArray().len(0, 100).default([]).value
        const bubbleResources = ctx.checkBody('bubbleResources').optional().isArray().len(0, 100).default([]).value
        const isPublish = ctx.checkBody('isPublish').optional().in([0, 1]).default(0).value

        ctx.allowContentType({type: 'json'}).validate()

        if (dutyStatements) {
            const result = statementAndBubbleSchema.validate(dutyStatements, statementAndBubbleSchema.dutyStatementsValidator)
            result.errors.length && ctx.error({msg: '参数dutyStatements格式校验失败', data: result.errors})
        }
        if (bubbleResources) {
            const result = statementAndBubbleSchema.validate(bubbleResources, statementAndBubbleSchema.bubbleResourcesValidator)
            result.errors.length && ctx.error({msg: '参数bubbleResources格式校验失败', data: result.errors})
        }
        if (policies) {
            const result = batchOperationPolicySchema.validate(policies, batchOperationPolicySchema.addPolicySegmentsValidator)
            result.errors.length && ctx.error({msg: '参数policies格式校验失败', data: result.errors})
        }

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({
            resourceId, userId: ctx.request.userId
        })
        if (!resourceInfo) {
            ctx.error({msg: 'resourceId错误或者没有权限'})
        }

        await this.authSchemeProvider.count({resourceId}).then(count => {
            count >= 100 && ctx.error({msg: '同一个资源授权点最多只能创建20个'})
        })

        await ctx.service.authSchemeService.createAuthScheme({
            authSchemeName, resourceInfo, languageType, isPublish,
            dutyStatements, bubbleResources,
            policies: {addPolicySegments: policies},
        }).then(ctx.success).catch(ctx.error)
    }

    /**
     * 更新资源的引用策略
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value
        const authSchemeName = ctx.checkBody('authSchemeName').optional().type("string").len(2, 100).trim().value
        const policies = ctx.checkBody('policies').optional().value //base64编码之后的字符串
        //注意:dutyStatements和bubbleResources参数不能默认[].否则代表清空
        const dutyStatements = ctx.checkBody('dutyStatements').optional().isArray().len(0, 100).value
        const bubbleResources = ctx.checkBody('bubbleResources').optional().isArray().len(0, 100).value
        ctx.allowContentType({type: 'json'}).validate()

        if (dutyStatements) {
            const result = statementAndBubbleSchema.validate(dutyStatements, statementAndBubbleSchema.dutyStatementsValidator)
            result.errors.length && ctx.error({msg: '参数dutyStatements格式校验失败', data: result.errors})
        }
        if (bubbleResources) {
            const result = statementAndBubbleSchema.validate(bubbleResources, statementAndBubbleSchema.bubbleResourcesValidator)
            result.errors.length && ctx.error({msg: '参数bubbleResources格式校验失败', data: result.errors})
        }
        if (policies) {
            const result = batchOperationPolicySchema.validate(policies, batchOperationPolicySchema.authSchemePolicyValidator)
            result.errors.length && ctx.error({msg: '参数policies格式校验失败', data: result.errors})
        }

        if (authSchemeName === undefined && policies === undefined && dutyStatements === undefined) {
            ctx.error({msg: "最少需要一个有效参数"})
        }

        const authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }
        if (authScheme.status === 1 && (dutyStatements || bubbleResources)) {
            ctx.error({msg: "授权方案已经发布,声明与上抛数据不允许改动"})
        }

        await ctx.service.authSchemeService.updateAuthScheme({
            authScheme, authSchemeName, policies, dutyStatements, bubbleResources
        }).then(() => {
            return this.authSchemeProvider.findById(authSchemeId)
        }).then(ctx.success).catch(ctx.error)
    }

    /**
     * 批量签约
     * @returns {Promise<void>}
     */
    async batchSignContracts(ctx) {

        const authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('id格式错误').value
        ctx.validate()

        const authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }
        if (authScheme.status !== 0) {
            ctx.error({msg: "授权方案状态校验失败", data: {authSchemeStatus: authScheme.status}})
        }

        await ctx.service.authSchemeService.batchSignContracts({authScheme}).then(ctx.success)
    }

    /**
     * 删除授权方案(不可恢复)
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('authSchemeId格式错误').value
        ctx.validate()

        const authScheme = await this.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }

        await ctx.service.authSchemeService.deleteAuthScheme(authScheme)
            .then(data => ctx.success(true)).catch(ctx.error)
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
}