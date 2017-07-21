/**
 * Created by yuliang on 2017/6/30.
 */


module.exports = options => async (ctx, next) => {
    let {retCodeEnum, errCodeEnum, type} = ctx.app
    try {
        if (process.env.pm_id !== undefined) {
            ctx.set("X-Agent-Server-Id", process.env.pm_id)
        }
        ctx.errors = []
        await next()
        if (ctx.body === undefined && /^[2|3]{1}\d{2}$/.test(ctx.response.status)) {
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