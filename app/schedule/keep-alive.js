'use strict'

const Subscription = require('egg').Subscription;

module.exports = class KeepAlive extends Subscription {

    static get schedule() {
        return {
            cron: '*/30 * * * * * *',
            type: 'worker',
            immediate: false,
            disable: false
        }
    }

    async subscribe() {
        await this.app.dal.resourceProvider.findOne({resourceId: "e759419923ea25bf6dff2694391a1e65c21739ce"})
    }
}