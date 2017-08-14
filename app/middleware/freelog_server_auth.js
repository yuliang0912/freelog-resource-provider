/**
 * Created by yuliang on 2017/7/21.
 */

module.exports = () => async (ctx, next) => {

    let {retCodeEnum, errCodeEnum} = ctx.app
    let authTokenStr = ctx.headers['auth-token']

    if (!authTokenStr) {
        ctx.response.status = 401;
        ctx.error({
            msg: '未认证的请求',
            retCode: retCodeEnum.authenticationFailure,
            errCode: errCodeEnum.refusedRequest
        })
    }

    let authToken = JSON.parse(new Buffer(authTokenStr, 'base64').toString())

    switch (authToken.type) {
        case 'jwt':
            ctx.request.userId = authToken.info.userId
            ctx.request.userInfo = authToken.info
            break
        default:
            ctx.response.status = 401;
            ctx.error({
                msg: '未认证的请求,不被支持的认证方式:' + authToken.type,
                retCode: retCodeEnum.authenticationFailure,
                errCode: errCodeEnum.refusedRequest
            })
            break;
    }
    await next()
}