/**
 * Created by yuliang on 2017/11/6.
 */

'use strict'

const mongoModels = require('../models/index')

module.exports = app => {

    const {type} = app

    return {
        /**
         * 创建合约
         * @param model
         * @returns {Promise.<TResult>}
         */
        createContract(model) {

            if (!type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            return mongoModels.contract.create(model).then()
        },

        /**
         * 查询合约
         * @param condition
         * @returns {*}
         */
        getContract(condition) {

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.contract.findOne(condition)
        }
    }
}