/**
 * Created by yuliang on 2017/8/15.
 * 组合资源本身所引用的其他资源的授权策略API
 */

'use strict'

const aliOss = require('ali-oss')
const Controller = require('egg').Controller
const JsonWebToken = require('egg-freelog-base/app/extend/helper/jwt_helper')

module.exports = class ResourceAuthController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.client = new aliOss(app.config.uploadConfig.aliOss)
        this.resourceAuthJwt = new JsonWebToken(app.config.RasSha256Key.resourceAuth.publicKey)
    }

    /**
     * 根据token获取资源授权URL
     * @param ctx
     * @returns {Promise.<void>}
     */
    async getResource(ctx) {

        const jwt = ctx.checkHeader('resource-signature').exist().notEmpty().value
        const response = ctx.checkHeader('response').optional().toJson().default({}).value

        ctx.validate(false)

        const authResult = this.resourceAuthJwt.verifyJwt(jwt.replace(/^bearer /i, ""))
        if (!authResult.isVerify) {
            ctx.error({msg: 'json-web-token校验失败', data: authResult})
        }

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: authResult.payLoad.resourceId})
        if (!resourceInfo) {
            ctx.error({msg: '未能找到资源'})
        }

        const objectKey = resourceInfo.resourceUrl.replace(/^http:\/\/freelog-shenzhen.oss-cn-shenzhen(-internal){0,1}.aliyuncs.com/, '')

        response['expires'] = 60
        response['response-content-type'] = resourceInfo.mimeType

        //默认60秒有效期
        resourceInfo.resourceUrl = this.client.signatureUrl(objectKey, response);

        ctx.success(resourceInfo)
    }
}