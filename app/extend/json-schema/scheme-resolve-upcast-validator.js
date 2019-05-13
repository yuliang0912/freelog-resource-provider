'use strict'

const FreelogCommonJsonSchema = require('egg-freelog-base/app/extend/json-schema/common-json-schema')

module.exports = class SchemeResolveAndUpcastValidator extends FreelogCommonJsonSchema {

    constructor() {
        super()
        this.__registerValidators__()
    }

    /**
     * 声明处理的obj格式校验
     * @param resolveReleases
     * @returns {ValidatorResult}
     */
    resolveReleasesValidate(resolveReleases) {
        return super.validate(resolveReleases, super.getSchema('/resolveReleasesSchema'))
    }

    /**
     * 上抛obj格式校验
     * @param upcastReleases
     * @returns {ValidatorResult}
     */
    upcastReleasesValidate(upcastReleases) {
        return super.validate(upcastReleases, super.getSchema('/upcastReleasesSchema'))
    }

    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__() {

        super.addSchema({
            id: "/resolveReleasesSchema",
            type: "array",
            uniqueItems: true,
            items: {
                type: "object",
                required: true,
                additionalProperties: false,
                properties: {
                    releaseId: {type: "string", required: true, format: 'mongoObjectId'},
                    contracts: {
                        type: "array",
                        uniqueItems: true,
                        required: true,
                        maxItems: 10,
                        minItems: 1,
                        items: {
                            type: "object",
                            required: true,
                            additionalProperties: false,
                            properties: {
                                policyId: {type: "string", required: true, format: 'md5'}
                                //contractId: {type: "string", format: 'mongoObjectId'}
                            }
                        }
                    }
                }
            }
        })

        super.addSchema({
            id: "/upcastReleasesSchema",
            type: "array",
            uniqueItems: true,
            items: {
                type: "object",
                required: true,
                additionalProperties: false,
                properties: {
                    releaseId: {type: "string", required: true, format: 'mongoObjectId'}
                }
            }
        })
    }
}

