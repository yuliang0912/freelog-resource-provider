/**
 * Created by yuliang on 2017/8/15.
 * 组合资源本身所引用的其他资源的授权策略API
 */

'use strict'

const aliOss = require('ali-oss')
const Controller = require('egg').Controller
const JsonWebToken = require('egg-freelog-base/app/extend/helper/jwt_helper')

module.exports = class ResourceAuthController extends Controller {

    constructor(arg) {
        super(arg)
        this.client = new aliOss(arg.app.config.uploadConfig.aliOss)
        this.resourceAuthJwt = new JsonWebToken(arg.app.config.RasSha256Key.resourceAuth.publicKey)
    }

    /**
     * 根据token获取资源授权URL
     * @param ctx
     * @returns {Promise.<void>}
     */
    async getResource(ctx) {

        let jwt = ctx.checkHeader('authorization').exist().notEmpty().value
        let response = ctx.checkHeader('response').optional().toJson().default({}).value

        ctx.validate(false)

        let authResult = this.resourceAuthJwt.verifyJwt(jwt.replace(/^bearer /i, ""))

        if (!authResult.isVerify) {
            ctx.error({msg: 'json-web-token校验失败', data: authResult})
        }

        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authResult.payLoad.resourceId})
        if (!resourceInfo) {
            ctx.error({msg: '未能找到资源'})
        }

        let objectKey = resourceInfo.resourceUrl.replace(/^http:\/\/freelog-shenzhen.oss-cn-shenzhen(-internal){0,1}.aliyuncs.com/, '')

        //默认60秒有效期
        resourceInfo.resourceUrl = this.client.signatureUrl(objectKey, Object.assign(response, {expires: 60}));

        ctx.success(resourceInfo)
    }
}