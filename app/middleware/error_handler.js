/**
 * Created by yuliang on 2017/6/30.
 */


module.exports = options => async (ctx, next) => {
    let {retCodeEnum, errCodeEnum, type} = ctx.app
    try {
        if (process.env.pm_id !== undefined) {
            ctx.set("X-Agent-Server-Id", process.env.pm_id)
        }
        await next()
        if (ctx.response.status === 404 && ctx.body === undefined) {
            ctx.body = ctx.buildReturnObject(
                retCodeEnum.success,
                errCodeEnum.notReturnData, 'success', null)
        }
    } catch (e) {
        if (type.nullOrUndefined(e)) {
            e = new Error("not defined error")
        }
        if (!type.int32(e.retCode)) {
            e.retCode = retCodeEnum.serverError
        }
        if (!type.int32(e.errCode)) {
            e.errCode = errCodeEnum.autoSnapError
        }
        ctx.body = ctx.buildReturnObject(e.retCode, e.errCode, e.message || e.toString())
    }
}