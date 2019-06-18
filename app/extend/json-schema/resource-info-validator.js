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
     * 资源依赖项格式校验
     * @param dependencies
     */
    resourceDependencyValidate(dependencies) {
        return super.validate(dependencies, super.getSchema('/dependReleasesSchema'))
    }

    /**
     * mock资源依赖项格式校验
     * @param dependencyInfo
     */
    mockResourceDependencyValidate(dependencyInfo) {
        return super.validate(dependencyInfo, super.getSchema('/mockResourceDependencySchema'))
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

        super.addSchema({
            id: "/dependMocksSchema",
            type: "array",
            uniqueItems: true,
            items: {
                type: "object",
                required: true,
                additionalProperties: false,
                properties: {
                    mockResourceId: {type: "string", required: true, format: 'mongoObjectId'}
                }
            }
        })

        super.addSchema({
            id: "/mockResourceDependencySchema",
            type: "object",
            required: true,
            additionalProperties: false,
            properties: {
                mocks: {$ref: "/dependMocksSchema"},
                releases: {$ref: "/dependReleasesSchema"}
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

