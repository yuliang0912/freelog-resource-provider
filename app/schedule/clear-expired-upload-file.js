/**
 * 清理过期的上传临时资源文件
 */

'use strict'

const Subscription = require('egg').Subscription;
const {releaseSchemeBindContractEvent} = require('../enum/resource-events')

module.exports = class ClearExpiredUploadFile extends Subscription {

    static get schedule() {
        return {
            type: 'worker',
            immediate: true,
            cron: '0 0 4 */1 * *', //每天凌晨4点执行一次
        }
    }

    /**
     * 定时清理掉已经过期的临时上传文件
     * @returns {Promise<void>}
     */
    async subscribe() {

        const {app} = this

        await app.dal.temporaryUploadFileProvider.deleteMany({expireDate: {$lt: Date()}})

        // app.dal.releaseSchemeProvider.find({}, null, {createDate: 1}).then(list => {
        //     list.forEach(scheme => {
        //         app.emit(releaseSchemeBindContractEvent, scheme)
        //     })
        // })
    }

}