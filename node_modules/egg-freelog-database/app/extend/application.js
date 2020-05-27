'use strict'

const {mongooseModelSymbol, knexSymbol, dataProviderSymbol} = require('../../lib/constan')

module.exports = {

    /**
     * moogoose实体
     * @returns {*}
     */
    get model() {
        return this[mongooseModelSymbol] || {}
    },

    /**
     * knex数据层入口
     * @returns {*}
     */
    get knex() {
        return this[knexSymbol] || {}
    },

    /**
     * 数据提供层入口
     * @returns {*}
     */
    get dataProvider() {
        return this[dataProviderSymbol]
    },

    /**
     * 数据提供层入口(dataProvider别名)
     * @returns {*}
     */
    get dal() {
        return this.dataProvider
    },

    /**
     * moogoose-model转换成js对象
     * @param data
     * @returns {*}
     */
    toObject(data) {
        return data && data.toObject ? data.toObject() : data
    },
}