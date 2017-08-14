/**
 * Created by yuliang on 2017/6/30.
 */
const resourceType = require('../enum/resource_type')
const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')

module.exports = (() => {

    const appExpand = {
        /**
         * 资源类型
         */
        resourceType: resourceType,

        /**
         * 资源内部属性
         */
        resourceAttribute: resourceAttribute,

        /**
         * 资源状态
         */
        resourceStatus: resourceStatus,

    }

    return appExpand

})()