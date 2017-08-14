/**
 * Created by yuliang on 2017/8/11.
 */

'use strict'

module.exports = app => {
    return class PolicyController extends app.Controller {
        
        async index(ctx) {
            ctx.success([])
        }

        /**
         * 展示资源的引用策略
         * @param ctx
         * @returns {Promise.<void>}
         */
        async show(ctx) {

            let resourceId = ctx.checkParams('id').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            let showType = ctx.checkQuery('showType').default('json').in(['json', 'yml']).value

            await ctx.validate().service.resourcePolicyService.getResourcePolicy({resourceId})
                .then(data => {
                    ctx.success(showType === 'json' ? data.policySegment : data.policyDescription)
                }).bind(ctx).catch(ctx.error)
        }

        /**
         * 创建资源的引用策略
         * @param ctx
         * @returns {Promise.<void>}
         */
        async create(ctx) {
            if (!ctx.is('json')) {
                ctx.error({msg: 'content-type Error:must be application/json'})
            }
            let resourceId = ctx.checkBody('resourceId').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            //base64编码之后的yaml字符串
            let policySegment = ctx.checkBody('policySegment').notEmpty().isBase64().decodeBase64().value

            await ctx.validate().service.resourcePolicyService.createOrUpdateResourcePolicy(ctx.request.userId, resourceId, policySegment).bind(ctx)
                .then(data => {
                    ctx.success(!!data)
                }).catch(ctx.error)
        }

        /**
         * 编辑资源的引用策略
         * @returns {Promise.<void>}
         */
        async edit(ctx) {

        }

        /**
         * 更新资源的引用策略
         * @returns {Promise.<void>}
         */
        async update(ctx) {
            if (!ctx.is('json')) {
                ctx.error({msg: 'content-type Error:must be application/json'})
            }

            let resourceId = ctx.checkParams('id').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            //base64编码之后的yaml字符串
            let policySegment = ctx.checkBody('policySegment').notEmpty().isBase64().decodeBase64().value

            ctx.validate()

            let resourceInfo = await ctx.service.resourceService.getResourceInfo({
                resourceId: resourceId,
                userId: ctx.request.userId
            })

            if (!resourceInfo) {
                ctx.error({msg: '资源不存在或资源用户匹配错误'})
            }

            await ctx.service.resourcePolicyService.createOrUpdateResourcePolicy(ctx.request.userId, resourceId, policySegment).bind(ctx).then(data => {
                ctx.success(!!data)
            }).catch(ctx.error)
        }
    }
}