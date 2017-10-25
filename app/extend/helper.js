/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('node-uuid')
const polifyParseFactory = require('./helper/policy_parse_factory')
const resourceCheck = require('./helper/resource_check')

module.exports = {

    /**
     * node-uuid
     */
    uuid: uuid,

    /**
     * 授权语言转换
     */
    policyParse: polifyParseFactory.parse,

    /**
     * 资源检测
     */
    resourceCheck: resourceCheck
}

