/**
 * Created by yuliang on 2017/6/30.
 */

const is = require('is-type-of')
const knexClient = require('./tools/knex_client')
const {retCodeEnum, errCodeEnum} = require('../enum/error_code')
const knexInstall = Symbol("application#knexInstall")
const resourceType = require('../enum/resource_type')
const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')
//const mongoModels = require('../models/index')

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
         * 资源类型
         */
        resourceType: resourceType,

        /**
         * 资源内部属性
         */
        resourceAttribute: resourceAttribute,

        /**
         * 资源状态
         */
        resourceStatus: resourceStatus,

        /**
         * mongo数据模型
         */
        //mongo: mongoModels,

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