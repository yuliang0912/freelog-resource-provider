/**
 * Created by yuliang on 2017/8/11.
 * 资源对外引用策略相关restful API
 */

'use strict'

module.exports = app => {
    return class PolicyController extends app.Controller {

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
                    ctx.success(data ? {
                        resourceId: data.resourceId,
                        policyId: data.policyId,
                        policySegment: (showType === 'json' ? data.policySegment : data.policyDescription)
                    } : null)
                }).bind(ctx).catch(ctx.error)
        }

        /**
         * 创建资源的引用策略
         * @param ctx
         * @returns {Promise.<void>}
         */
        async create(ctx) {

            let resourceId = ctx.checkBody('resourceId').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            //base64编码之后的yaml字符串
            let policySegment = ctx.checkBody('policySegment').notEmpty().isBase64().decodeBase64().value

            let policyId = ctx.helper.uuid.v4()

            ctx.allowContentType({type: 'json'}).validate()

            await ctx.service.resourcePolicyService.createOrUpdateResourcePolicy(ctx.request.userId, resourceId, policySegment, policyId).bind(ctx)
                .then(data => ctx.success(!!data)).catch(ctx.error)
        }

        /**
         * 更新资源的引用策略
         * @returns {Promise.<void>}
         */
        async update(ctx) {

            let resourceId = ctx.checkParams('id').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            //base64编码之后的yaml字符串
            let policySegment = ctx.checkBody('policySegment').notEmpty().isBase64().decodeBase64().value

            let policyId = ctx.helper.uuid.v4()

            ctx.allowContentType({type: 'json'}).validate()

            let resourceInfo = await ctx.service.resourceService.getResourceInfo({
                resourceId: resourceId,
                userId: ctx.request.userId
            })

            if (!resourceInfo) {
                ctx.error({msg: '资源不存在或资源用户匹配错误'})
            }

            await ctx.service.resourcePolicyService.createOrUpdateResourcePolicy(ctx.request.userId, resourceId, policySegment, policyId)
                .bind(ctx).then(data => ctx.success(!!data)).catch(ctx.error)
        }

        /**
         * 删除资源引用策略
         * @param ctx
         * @returns {Promise.<void>}
         */
        async destroy(ctx) {

            let resourceId = ctx.checkParams('id').match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            ctx.validate()

            let resourceInfo = await ctx.service.resourceService.getResourceInfo({
                resourceId: resourceId,
                userId: ctx.request.userId
            })

            if (!resourceInfo) {
                ctx.error({msg: '资源不存在或资源用户匹配错误'})
            }

            //此处保持请求幂等性,返回无异常即为删除成功,故直接返回true
            await ctx.service.resourcePolicyService.deleteResourcePolicy({resourceId}).bind(ctx)
                .then(data => ctx.success(true)).catch(ctx.error)
        }
    }
}