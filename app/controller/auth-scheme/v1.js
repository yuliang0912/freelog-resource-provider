/**
 * Created by yuliang on 2018/3/27.
 * 资源对外引用策略相关restful API
 */

'use strict';

const Controller = require('egg').Controller;
const dependStatementSchema = require('../../extend/helper/json-schema/depend-statement-schema')

module.exports = class PolicyController extends Controller {

    /**
     * 获取policyList
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        let resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().value

        ctx.validate()

        let condition = {
            resourceId: {$in: resourceIds}
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

        let resourceId = ctx.checkBody('resourceId').isResourceId().value
        let authSchemeName = ctx.checkBody('authSchemeName').type("string").len(2, 100).trim().value
        let policyText = ctx.checkBody('policyText').notEmpty().isBase64().decodeBase64().value //base64编码之后的字符串
        let languageType = ctx.checkBody('languageType').default('freelog_policy_lang').in(['freelog_policy_lang']).value
        let dependStatements = ctx.checkBody('dependStatements').default([]).isArray().value
        ctx.allowContentType({type: 'json'}).validate()

        if (dependStatements.length) {
            let result = dependStatementSchema.jsonSchemaValidator.validate(dependStatements, dependStatementSchema.dependStatementArraySchema)
            if (result.errors.length) {
                ctx.error({
                    msg: "参数dependStatements格式校验失败",
                    data: result,
                    errCode: ctx.app.errCodeEnum.paramValidateError
                })
            }
        }

        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({
            resourceId, userId: ctx.request.userId
        })
        if (!resourceInfo) {
            ctx.error({msg: 'resourceId错误或者没有权限'})
        }

        await ctx.service.authSchemeService.createAuthScheme({
            authSchemeName,
            resourceInfo,
            policyText,
            languageType,
            dependStatements
        }).then(data => ctx.success(data)).catch(err => ctx.error(err))
    }

    /**
     * 更新资源的引用策略
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        let authSchemeId = ctx.checkParams('id').isMongoObjectId('id格式错误').value
        let authSchemeName = ctx.checkBody('authSchemeName').optional().type("string").len(2, 100).trim().value
        let policyText = ctx.checkBody('policyText').optional().isBase64().decodeBase64().value //base64编码之后的字符串
        let dependStatements = ctx.checkBody('dependStatements').optional().isArray().value
        let status = ctx.checkBody('status').optional().toInt().in([1, 2]).value
        ctx.allowContentType({type: 'json'}).validate()

        //都为undefined
        if (authSchemeName === policyText && policyText === dependStatements && dependStatements === status) {
            ctx.error({msg: "最少需要一个有效参数"})
        }

        let authScheme = await  ctx.dal.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }

        await ctx.service.authSchemeService.updateAuthScheme({
            authScheme: authScheme.toObject(),
            authSchemeName,
            policyText,
            dependStatements,
            status
        }).then(() => {
            return ctx.dal.authSchemeProvider.findById(authSchemeId)
        }).then(data => ctx.success(data)).catch(err => ctx.error(err))
    }

    /**
     * 管理申明的依赖之间的合约
     * @param ctx
     * @returns {Promise<void>}
     */
    async manageDependStatementContracts(ctx) {

        let authSchemeId = ctx.checkParams('authSchemeId').isMongoObjectId('id格式错误').value
        let dependStatements = ctx.checkBody('dependStatements').exist().isArray().len(1, 20).value
        ctx.allowContentType({type: 'json'}).validate()

        let result = dependStatementSchema.jsonSchemaValidator.validate(dependStatements, dependStatementSchema.dependStatementArraySchema)

        result.errors.length && ctx.error({
            msg: "参数dependStatements格式校验失败",
            data: result,
            errCode: ctx.app.errCodeEnum.paramValidateError
        })

        let authScheme = await ctx.dal.authSchemeProvider.findById(authSchemeId)
        if (!authScheme || authScheme.userId !== ctx.request.userId) {
            ctx.error({msg: "未找到授权方案或者授权方案与用户不匹配", data: ctx.request.userId})
        }

        await ctx.service.authSchemeService.manageDependStatementContract({
            dependStatements,
            authScheme: authScheme.toObject(),
        }).then(() => {
            return ctx.dal.authSchemeProvider.findById(authSchemeId)
        }).then(data => ctx.success(data)).catch(err => ctx.error(err))
    }
}