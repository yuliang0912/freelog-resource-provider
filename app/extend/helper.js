/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const fileCheck = new (require('./file-check/index'))
const polifyParseFactory = require('./helper/policy_parse_factory')
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
     * 文件检查
     * @param args
     * @returns {*}
     */
    resourceFileCheck(...args) {
        return fileCheck.main(...args)
    },

    /**
     * 资源依赖检查
     */
    resourceDependencyCheck: resourceDependencyCheck
}

