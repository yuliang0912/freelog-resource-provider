/**
 * Created by yuliang on 2017/7/21.
 */

module.exports = () => async (ctx, next) => {
    if (ctx.app.env === 'local') {
        ctx.request.userId = 123456;
        await next()
        return;
    }

    let authStr = ctx.header.authorization || "";
    //用户ID必须是5到12位数的数字
    let userPassRegExp = /^([\d]{5,12}?):(.*)$/;
    let credentialsRegExp = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9\-\._~\+\/]+=*) *$/;
    let match = credentialsRegExp.exec(authStr);

    if (!match) {
        notAuthorized(ctx)
    }
    let userPass = userPassRegExp.exec(new Buffer(match[1], 'base64').toString());
    if (!userPass) {
        notAuthorized(ctx)
    }
    ctx.request.userId = parseInt(userPass[1]);

    function notAuthorized(ctx) {
        let {retCodeEnum, errCodeEnum} = ctx.app
        ctx.response.status = 401;
        throw Object.assign(new Error("未认证的请求"),
            {
                retCode: retCodeEnum.authenticationFailure,
                errCode: errCodeEnum.refusedRequest
            });
    }

    await next()
}