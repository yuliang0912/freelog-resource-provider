/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const fileCheck = require('./resource-file-check/index')
const policyCompiler = require('./policy-compiler/index')
const subsidiaryFileCheck = require('./subsidiary-file-check/index')
const resourceAttributeCheck = require('./resource-attribute-check/index')

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
     */
    resourceFileCheck(...args) {
        return fileCheck.main(...args)
    },

    /**
     * 附属文件检查
     */
    subsidiaryFileCheck(...args) {
        return subsidiaryFileCheck.main(...args)
    },

    /**
     * 资源属性检查
     * @param args
     * @returns {*}
     */
    resourceAttributeCheck(...args) {
        return resourceAttributeCheck.main(...args)
    }
}

