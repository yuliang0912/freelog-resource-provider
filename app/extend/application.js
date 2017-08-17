/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'


const resourceType = require('../enum/resource_type')
const resourceStatus = require('../enum/resource_status')
const resourceAttribute = require('../enum/resource_attribute')


module.exports = (() => {

    const appExpand = {
        /**
         * 资源类型
         */
        resourceType,

        /**
         * 资源内部属性
         */
        resourceAttribute,

        /**
         * 资源状态
         */
        resourceStatus,

    }

    return appExpand

})()