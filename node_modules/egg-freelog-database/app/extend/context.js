'use strict'

module.exports = {
    /**
     * 获取mongodb-model
     * @returns {*}
     */
    get model() {
        return this.app.model
    },

    /**
     * 获取knex
     * @returns {*}
     */
    get knex() {
        return this.app.knex
    }
}