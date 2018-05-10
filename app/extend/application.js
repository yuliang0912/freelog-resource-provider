/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')

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
}
