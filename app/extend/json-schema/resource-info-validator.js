'use strict'

const semver = require('semver')
const {trim} = require('lodash/string')
const FreelogCommonJsonSchema = require('egg-freelog-base/app/extend/json-schema/common-json-schema')

module.exports = class ResourceInfoValidator extends FreelogCommonJsonSchema {

    constructor() {
        super()
        this.__registerValidators__()
        this.__registerCustomFormats__()
    }

    /**
     * 依赖的方案格式校验
     * @param dependencies
     */
    dependReleasesValidate(dependencies) {
        return super.validate(dependencies, super.getSchema('/dependReleasesSchema'))
    }

    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__() {

        super.addSchema({
            id: "/dependReleasesSchema",
            type: "array",
            uniqueItems: true,
            items: {
                type: "object",
                required: true,
                additionalProperties: false,
                properties: {
                    releaseId: {type: "string", required: true, format: 'mongoObjectId'},
                    versionRange: {type: "string", required: true, format: 'versionRange'}
                }
            }
        })
    }

    /**
     * 注册自定义校验格式
     * @private
     */
    __registerCustomFormats__() {

        /**
         * semver范围版本格式校验
         */
        super.registerCustomFormats('versionRange', (input) => {
            return trim(input, ' ') && semver.validRange(input)
        })
    }
}

