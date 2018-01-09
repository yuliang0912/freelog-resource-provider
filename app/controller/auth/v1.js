/**
 * Created by yuliang on 2017/8/15.
 * 组合资源本身所引用的其他资源的授权策略API
 */

'use strict'

const aliOss = require('ali-oss')
const JsonWebToken = require('egg-freelog-base/app/extend/helper/jwt_helper')

module.exports = app => {

    const dataProvider = app.dataProvider
    const client = new aliOss(app.config.uploadConfig.aliOss)
    const resourceAuthJwt = new JsonWebToken(app.config.RasSha256Key.resourceAuth.publicKey)

    return class AuthController extends app.Controller {

        /**
         * 根据token获取资源授权URL
         * @param ctx
         * @returns {Promise.<void>}
         */
        async getResource(ctx) {

            let jwt = ctx.checkHeader('authorization').exist().notEmpty().value
            let response = ctx.checkHeader('response').optional().toJson().default({}).value

            ctx.validate()

            let authResult = resourceAuthJwt.verifyJwt(jwt.replace(/^bearer /i, ""))

            if (!authResult.isVerify) {
                ctx.error({msg: 'json-web-token校验失败', data: authResult})
            }

            let resourceInfo = await dataProvider.resourceProvider.getResourceInfo({resourceId: authResult.payLoad.resourceId})
            if (!resourceInfo) {
                ctx.error({msg: '未能找到资源'})
            }

            let objectKey = resourceInfo.resourceUrl.replace(/^http:\/\/freelog-shenzhen.oss-cn-shenzhen(-internal){0,1}.aliyuncs.com/, '')

            //默认60秒有效期
            resourceInfo.resourceUrl = client.signatureUrl(objectKey, Object.assign(response, {expires: 60}));

            ctx.success(resourceInfo)
        }
    }
}