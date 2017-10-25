/**
 * Created by yuliang on 2017/10/24.
 */

'use strict'

const moment = require('moment')

module.exports = app => {
    return class ComponentsService extends app.Service {

        /**
         * 创建web components
         * @param model
         * @returns {*}
         */
        create(model) {
            let {type, knex} = this.app

            if (!type.object(model)) {
                return Promise.reject(new Error("model is not object"))
            }

            model.createDate = moment().toDate()

            return knex.resource('components').insert(model)
        }

    }
}