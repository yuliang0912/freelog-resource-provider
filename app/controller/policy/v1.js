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

            let policyId = ctx.checkParams('id').notEmpty().value
            let showType = ctx.checkQuery('showType').default('json').in(['json', 'yml']).value

            await ctx.validate().service.resourcePolicyService.getResourcePolicy({
                _id: policyId,
                status: 0
            }).then(data => {
                ctx.success(data ? {
                    policyId: data._id,
                    resourceId: data.resourceId,
                    serialNumber: data.serialNumber,
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

            //let policyDescriptionBuffer = new Buffer(policySegment, 'utf8')

            ctx.allowContentType({type: 'json'}).validate()

            await ctx.service.resourcePolicyService.createOrUpdateResourcePolicy(ctx.request.userId, resourceId, policySegment).bind(ctx)
                .then(data => ctx.success(data._id)).catch(ctx.error)
        }

        /**
         * 更新资源的引用策略
         * @returns {Promise.<void>}
         */
        async update(ctx) {

            let policyId = ctx.checkParams('id').notEmpty().value
            //base64编码之后的yaml字符串
            let policySegment = ctx.checkBody('policySegment').notEmpty().isBase64().decodeBase64().value

            ctx.allowContentType({type: 'json'}).validate()

            let policy = await ctx.validate().service.resourcePolicyService.getResourcePolicy({
                _id: policyId,
                userId: ctx.request.userId
            })

            if (!policy || policy.status !== 0) {
                ctx.error({msg: "未找到需要更新的策略或者策略与用户不匹配"})
            }

            await ctx.service.resourcePolicyService.createOrUpdateResourcePolicy(policy.userId, policy.resourceId, policySegment)
                .bind(ctx).then(data => ctx.success(!!data)).catch(ctx.error)
        }

        /**
         * 删除资源引用策略
         * @param ctx
         * @returns {Promise.<void>}
         */
        async destroy(ctx) {

            let policyId = ctx.checkParams('id').notEmpty().value
            ctx.validate()

            let policy = await ctx.validate().service.resourcePolicyService.getResourcePolicy({
                _id: policyId,
                userId: ctx.request.userId
            })

            if (!policy) {
                ctx.error({msg: "策略不存在或者策略与用户不匹配"})
            }

            //此处保持请求幂等性,返回无异常即为删除成功,故直接返回true
            await ctx.service.resourcePolicyService.deleteResourcePolicy({_id: policyId}).bind(ctx)
                .then(data => ctx.success(true)).catch(ctx.error)
        }
    }
}