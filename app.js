'use strict'

const moment = require('moment')
const cryptoHelper = require('egg-freelog-base/app/extend/helper/crypto_helper')

module.exports = class AppBootHook {

    constructor(app) {
        this.app = app;
    }

    async willReady() {
        this.decodeOssConfig()
        //console.log(moment().format('YYYY-MM-DD'))
        await this.app.rabbitClient.connect()
    }

    decodeOssConfig() {
        let {aliOss} = this.app.config.uploadConfig
        if (aliOss.isCryptographic) {
            aliOss.accessKeyId = cryptoHelper.base64Decode(aliOss.accessKeyId)
            aliOss.accessKeySecret = cryptoHelper.base64Decode(aliOss.accessKeySecret)
        }
    }
}