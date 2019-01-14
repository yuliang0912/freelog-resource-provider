/**
 * Created by yuliang on 2017/10/24.
 */

'use strict'

const moment = require('moment')
const KnexBaseOperation = require('egg-freelog-database/lib/database/knex-base-operation')

module.exports = class ComponentsProvider extends KnexBaseOperation {

    constructor(app) {
        super(app.knex.resource('components'), 'widgetName')
        this.app = app
    }


    /**
     * 创建web components
     * @param model
     * @returns {*}
     */
    create(model) {

        if (!super.type.object(model)) {
            return Promise.reject(new Error("model is not object"))
        }
        model.createDate = moment().toDate()

        return super.create(model)
    }
}