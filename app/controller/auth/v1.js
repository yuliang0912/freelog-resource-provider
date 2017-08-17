/**
 * Created by yuliang on 2017/8/15.
 * 组合资源本身所引用的其他资源的授权策略API
 */

'use strict'

module.exports = app => {
    return class AuthController extends app.Controller {

        /**
         * 创建符合资源的授权引用信息
         * @param ctx
         * @returns {Promise.<void>}
         */
        async create(ctx) {
            let resourceId = ctx.checkBody('resourceId').exist().match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            let quotePolicies = ctx.checkBody('quotePolicies').exist().type("array").value

            ctx.validate().success(quotePolicies)
        }

    }
}