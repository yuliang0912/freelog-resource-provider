/**
 * Created by yuliang on 2017/6/30.
 */

const is = require('is-type-of')
const knexClient = require('./tools/knex_client')
const {retCodeEnum, errCodeEnum} = require('../enum/error_code')
const knexInstall = Symbol("application#knexInstall")

module.exports = (() => {

    const appExpand = {
        /**
         * 类型判断
         */
        type: is,

        /**
         * 一级错误码
         */
        retCodeEnum: retCodeEnum,

        /**
         * 二级错误码
         */
        errCodeEnum: errCodeEnum,

        /**
         * knex-DB操作
         * @returns {knexClients}
         */
        get knex() {
            if (!this[knexInstall]) {
                this[knexInstall] = knexClient(this.config.dbConfig)
            }
            return this[knexInstall]
        }
    }

    return appExpand

})()