/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const fileCheck = require('./resource-file-check/index')
const policyCompiler = require('./policy-compiler/index')
const subsidiaryFileCheck = require('./subsidiary-file-check/index')
const resourceAttributeCheck = require('./resource-attribute-check/index')
const resourceDependencyCheck = require('./resource-attribute-check/resource_dependencies_check')

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
    },

    /**
     * 资源依赖检查
     */
    resourceDependencyCheck({dependencies, resourceId}) {
        return resourceDependencyCheck.check(...arguments)
    },

    htmlEncode(str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        return s;
    },

    htmlDecode(str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
}

