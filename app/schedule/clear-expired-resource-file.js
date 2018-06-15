/**
 * 清理过期的上传临时资源文件
 */

'use strict'

const Subscription = require('egg').Subscription;

module.exports = class ClearExpiredResourceFile extends Subscription {

    static get schedule() {
        return {
            type: 'worker',
            cron: '0 0 4 */1 * * *', //每天凌晨4点执行一次
        }
    }

    async subscribe() {
        console.log('定时执行清理过期文件任务')
    }
}