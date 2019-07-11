'use strict'

const Subscription = require('egg').Subscription;

module.exports = class ClearExpiredUploadFile extends Subscription {

    static get schedule() {
        return {
            type: 'worker',
            cron: '0 0 */2 * * *', //每2小时执行一次
        }
    }

    /**
     * 定时统计发行的最新版本授权链授权结果
     * @returns {Promise<void>}
     */
    async subscribe() {
        const {app} = this
    }

}