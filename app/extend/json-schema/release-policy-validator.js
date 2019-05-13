'use strict'

const validator = require('egg-freelog-base/app/extend/application').validator
const FreelogCommonJsonSchema = require('egg-freelog-base/app/extend/json-schema/common-json-schema')

module.exports = class ReleasePolicyValidator extends FreelogCommonJsonSchema {

    constructor() {
        super()
        this.__registerValidators__()
        this.__registerCustomFormats__()
    }

    /**
     * 创建发行策略验证
     * @param policies
     * @returns {ValidatorResult}
     */
    createReleasePoliciesValidate(policies) {
        return super.validate(policies, super.getSchema('/addPoliciesSchema'))
    }

    /**
     * 更新发行策略验证
     * @param policyInfo
     * @returns {ValidatorResult}
     */
    updateReleasePoliciesValidate(policyInfo) {
        return super.validate(policyInfo, super.getSchema('/updateReleasePoliciesSchema'))
    }

    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__() {

        super.addSchema({
            id: "/updateReleasePoliciesSchema",
            type: "object",
            required: true,
            properties: {
                additionalProperties: false,
                addPolicies: {$ref: "/addPoliciesSchema"},
                updatePolicies: {
                    type: "array",
                    uniqueItems: true,
                    maxItems: 20,
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            policyId: {required: true, type: "string", format: 'md5'},
                            policyName: {
                                required: true,
                                type: "string",
                                minLength: 1,
                                maxLength: 20,
                                format: "policyName"
                            },
                            status: {required: true, type: "integer", minimum: 0, maximum: 1}
                        }
                    }
                }
            }
        })

        super.addSchema({
            id: "/addPoliciesSchema",
            type: "array",
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: "object",
                required: true,
                additionalProperties: false,
                properties: {
                    policyName: {required: true, minLength: 1, maxLength: 20, type: "string", format: "policyName"},
                    policyText: {required: true, type: "string", format: 'base64'}
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
         * 策略名称格式
         * @param input
         * @returns {boolean}
         */
        super.registerCustomFormats('policyName', (input) => {
            input = input.trim()
            return input.length >= 2 && input.length < 20
        })

        /**
         * 是否base64
         */
        super.registerCustomFormats('base64', (input) => {
            return validator.isBase64(input)
        })
    }
}

