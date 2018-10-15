/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const lodash = require('lodash')
const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')
const previewImageOssKey = Symbol("resource#previewImageOssKey")


module.exports = {

    /**
     * 资源内部属性
     */
    get resourceAttribute() {
        return resourceAttribute(this.resourceType)
    },

    /**
     * 资源状态
     */
    resourceStatus,

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
