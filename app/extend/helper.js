/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const polifyParseFactory = require('./helper/policy_parse_factory')
const resourceCheck = require('./helper/resource_file_check')
const resourceDependencyCheck = require('./helper/resource_dependencies_check')

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
     * 资源文件检测
     */
    resourceCheck: resourceCheck,

    /**
     * 资源依赖检查
     */
    resourceDependencyCheck: resourceDependencyCheck
}

