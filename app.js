/**
 * Created by yuliang on 2017/6/30.
 */

const koaValidate = require('koa-validate')
const mongoDb = require('./app/models/db')

module.exports = async (app) => {

    koaValidate(app)

    app.on('error', (err, ctx) => {
        if (!err || !ctx) {
            return
        }
        ctx.body = ctx.buildReturnObject(app.retCodeEnum.serverError,
            app.errCodeEnum.autoSnapError,
            err.message || err.toString())
    })

    process.on('unhandledRejection', err => {
        console.log("process-on-unhandledRejection事件:" + err.stack || err.toString())
    })

    process.on('uncaughtException', err => {
        console.log("process-on-uncaughtException,请检查日志,[detail]:" + err.stack || err.toString())
    })

    global.Promise = require('bluebird')

    await mongoDb.connect(app)
}