/**
 * Created by yuliang on 2018/3/27.
 * 资源对外引用策略相关restful API
 */

'use strict';

const Controller = require('egg').Controller;
const statementSchema = require('../../extend/json-schema/statement-schema')
const batchOperationPolicySchema = require('../../extend/json-schema/batch-operation-policy')

module.exports = class PolicyController extends Controller {

    /**
     * 获取policyList
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        let authSchemeIds = ctx.checkQuery('authSchemeIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 50).value
        let resourceIds = ctx.checkQuery('resourceIds').optional().isSplitResourceId().toSplitArray().len(1, 50).value
        let authSchemeStatus = ctx.checkQuery('authSchemeStatus').optional().toInt().in([0, 1, 4]).value

        ctx.validate()

        let condition = {}
        if (authSchemeIds) {
            condition._id = {$in: authSchemeIds}
        }
        if (resourceIds) {
            condition.resourceId = {$in: resourceIds}
        }
        if (!Object.keys(condition).length) {
            ctx.error({msg: '最少需要一个有效参数'})
        }
        if (authSchemeStatus !== undefined) {
            condition.status = authSchemeStatus
        }

        await ctx.dal.authSchemeProvider.find(condition).bind(ctx).then(ctx.success)
    }

    /**
     * 展示资源的引用策略
     * @param ctx
     * @returns {Promise.<void>}
     */
    async show(ctx) {

        let authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value

        ctx.validate()

        await  ctx.dal.authSchemeProvider.findById(authSchemeId).bind(ctx).then(ctx.success)
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
        const languageType = ctx.checkBody('languageType').default('freelog_policy_lang').in(['freelog_policy_lang']).value
        let dutyStatements = ctx.checkBody('dutyStatements').optional().isArray().len(0, 100).value
        const isPublish = ctx.checkBody('isPublish').optional().default(0).in([0, 1]).value

        ctx.allowContentType({type: 'json'}).validate()

        if (dutyStatements) {
            const result = statementSchema.jsonSchemaValidator.validate(dutyStatements, statementSchema.statementArraySchema)
            result.errors.length && ctx.error({msg: '参数dutyStatements格式校验失败', data: result.errors})
        }

        if (policies) {
            const result = batchOperationPolicySchema.jsonSchemaValidator
                .validate(policies, batchOperationPolicySchema.addPolicySegmentsValidator)
            result.errors.length && ctx.error({msg: '参数policies格式校验失败', data: result.errors})
        }

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({
            resourceId, userId: ctx.request.userId
        })
        if (!resourceInfo) {
            ctx.error({msg: 'resourceId错误或者没有权限'})
        }

        await ctx.dal.authSchemeProvider.count({resourceId}).then(count => {
            count >= 20 && ctx.error({msg: '同一个资源授权点最多只能创建20个'})
        })

        await ctx.service.authSchemeService.createAuthScheme({
            authSchemeName, resourceInfo, languageType, isPublish,
            policies: {addPolicySegments: policies},
            dutyStatements: dutyStatements || [],
        }).then(data => ctx.success(data))
    }

    /**
     * 更新资源的引用策略
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value
        const authSchemeName = ctx.checkBody('authSchemeName').optional().type("string").len(2, 100).trim().value
        const policies = ctx.checkBody('policies').optional().value //base64编码之后的字符串
        const dutyStatements = ctx.checkBody('dutyStatements').optional().isArray().len(0, 100).value
        ctx.allowContentType({type: 'json'}).validate()

        if (dutyStatements) {
            const result = statementSchema.jsonSchemaValidator
                .validate(dutyStatements, statementSchema.statementArraySchema)
            result.errors.length && ctx.error({msg: '参数dutyStatements格式校验失败', data: result.errors})
        }

        if (policies) {
            const result = batchOperationPolicySchema.jsonSchemaValidator
                .validate(policies, batchOperationPolicySchema.authSchemePolicyValidator)
            result.errors.length && ctx.error({msg: '参数policies格式校验失败', data: result.errors})
        }

        if (authSchemeName === undefined && policies === undefined && dutyStatements === undefined) {
            ctx.error({msg: "最少需要一个有效参数"})
        }

        let authScheme = await ctx.dal.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }
        if (authScheme.status === 1 && dutyStatements !== undefined) {
            ctx.error({msg: "授权方案已经发布,声明部分不允许改动"})
        }

        await ctx.service.authSchemeService.updateAuthScheme({
            authScheme: authScheme.toObject(), authSchemeName, policies, dutyStatements
        }).then(() => {
            return ctx.dal.authSchemeProvider.findById(authSchemeId)
        }).then(data => ctx.success(data)).catch(err => ctx.error(err))
    }

    /**
     * 批量签约
     * @returns {Promise<void>}
     */
    async batchSignContracts(ctx) {

        const authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('id格式错误').value
        ctx.validate()

        const authScheme = await ctx.dal.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }
        if (authScheme.status !== 0) {
            ctx.error({msg: "授权方案状态校验失败", data: {authSchemeStatus: authScheme.status}})
        }
        if (!authScheme.dutyStatements.length) {
            ctx.error({msg: "授权方案中不存在声明信息"})
        }

        await ctx.service.authSchemeService.batchSignContracts({
            authScheme: authScheme.toObject()
        }).then(data => {
            ctx.success(data)
        })
    }

    /**
     * 删除授权方案(不可恢复)
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const authSchemeId = ctx.checkParams('id').isMongoObjectId('authSchemeId格式错误').value
        ctx.validate()

        const authScheme = await ctx.dal.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }

        await ctx.service.authSchemeService.deleteAuthScheme(authSchemeId, authScheme.resourceId)
            .then(data => ctx.success(true)).catch(err => ctx.error(err))
    }
}