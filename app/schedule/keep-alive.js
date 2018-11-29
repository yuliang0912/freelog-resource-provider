'use strict'

const Subscription = require('egg').Subscription;

module.exports = class KeepAlive extends Subscription {

    static get schedule() {
        return {
            cron: '*/30 * * * * * *',
            type: 'all',
            immediate: false,
            disable: false
        }
    }

    async subscribe() {
        const port = this.app.config.cluster.listen.port
        return this.app.curl(`http://localhost:${port}/v1/resources/warehouse?page=1`).catch(console.error)
    }
}