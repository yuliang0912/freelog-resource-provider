/**
 * 清理过期的上传临时资源文件
 */

'use strict'

const Subscription = require('egg').Subscription;

module.exports = class ClearExpiredResourceFile extends Subscription {

    static get schedule() {
        return {
            type: 'worker',
            cron: '0 0 4 */1 * *', //每天凌晨4点执行一次
        }
    }

    /**
     * 定时清理掉已经过去30天的临时数据
     * @returns {Promise<void>}
     */
    async subscribe() {

        const {app} = this

        const currentDate = app.moment().toDate().toLocaleString()

        await app.dal.temporaryUploadFileProvider.deleteMany({expireDate: {$lt: currentDate}})
    }

}