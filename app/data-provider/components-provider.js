/**
 * Created by yuliang on 2017/10/24.
 */

'use strict'

const moment = require('moment')

module.exports = app => {

    let {type, knex} = app

    return {

        /**
         * 获取数量
         * @param condition
         */
        count(condition) {
            return knex.resource('components').where(condition).count("* as count").first()
        },

        /**
         * 查找一条
         * @param condition
         * @returns {Promise<never>}
         */
        findOne(condition) {
            if (!type.object(condition)) {
                return Promise.reject(new Error("condition is not object"))
            }
            return knex.resource('components').where(condition).orderBy("createDate", "desc").first()
        },

        /**
         * 创建web components
         * @param model
         * @returns {*}
         */
        create(model) {

            if (!type.object(model)) {
                return Promise.reject(new Error("model is not object"))
            }

            model.createDate = moment().toDate()

            return knex.resource('components').insert(model)
        }
    }
}