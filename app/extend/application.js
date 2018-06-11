/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')
const restfulWebApi = require('./restful-web-api/index')
let restfulWebApiInstance = null

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
     * restful-base-url
     * @returns {*}
     */
    get webApi() {
        if (restfulWebApiInstance === null) {
            restfulWebApiInstance = new restfulWebApi(this.config)
        }
        return restfulWebApiInstance
    },
}
