/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const lodash = require('lodash')
const rabbitClient = require('./helper/rabbit_mq_client')
const previewImageOssKey = Symbol("resource#previewImageOssKey")

module.exports = {

    get rabbitClient() {
        return new rabbitClient(this.config.rabbitMq)
    },
    
    /**
     * 预览图上传的oss对象
     */
    get previewImageOssClient() {
        if (!this.__cacheMap__.has(previewImageOssKey)) {
            const uploadConfig = lodash.defaultsDeep({}, {uploadConfig: {aliOss: {bucket: 'freelog-image'}}}, this.config)
            this.__cacheMap__.set(previewImageOssKey, this.ossClientCustom(uploadConfig))
        }
        return this.__cacheMap__.get(previewImageOssKey)
    },
}
