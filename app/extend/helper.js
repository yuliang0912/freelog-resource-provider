/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const fileCheck = new (require('./file-check/index'))
const policyCompiler = new (require('./policy-compiler/index'))
const resourceDependencyCheck = new (require('./resource-attribute-check/resource_dependencies_check'))

module.exports = {

    /**
     * node-uuid
     */
    uuid: uuid,

    /**
     * 授权语言转换{policyText, languageType, policyName}
     */
    policyCompiler(...args) {
        return policyCompiler.compiler(...args)
    },

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
    resourceDependencyCheck(...args) {
        return resourceDependencyCheck.check(...args)
    }
}

