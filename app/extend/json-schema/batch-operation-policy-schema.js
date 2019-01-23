'use strict'

const FreelogCommonJsonSchema = require('./freelog-common-json-schema')

class BatchOperationPolicyJsonSchemaValidator extends FreelogCommonJsonSchema {

    constructor() {
        super()
        this.__initial__()
    }

    /**
     * 更新授权策略段主题校验
     * @returns {ActiveX.ISchema}
     */
    get authSchemePolicyValidator() {
        return super.getSchema('/authSchemePolicyValidatorSchema')
    }

    /**
     * 新增策略段主题校验
     * @returns {ActiveX.ISchema}
     */
    get addPolicySegmentsValidator() {
        return super.getSchema('/addPolicySegmentsSchema')
    }

    /**
     * 初始化函数
     * @private
     */
    __initial__() {
        this.__registerValidators__()
        this.__registerCustomFormats__()
    }

    /**
     * 注册所有的校验
     * @private
     */
    __registerValidators__() {

        super.addSchema({
            id: "/authSchemePolicyValidatorSchema",
            type: "object",
            properties: {
                removePolicySegments: {
                    type: "array",
                    uniqueItems: true,
                    maxItems: 20,
                    items: {type: "string", format: 'md5'}
                },
                addPolicySegments: {$ref: "/addPolicySegmentsSchema"},
                updatePolicySegments: {
                    type: "array",
                    uniqueItems: true,
                    maxItems: 20,
                    items: {$ref: "/updatePolicySegmentSchema"}
                }
            }
        })

        super.addSchema({
            id: "/updatePolicySegmentSchema",
            type: "object",
            additionalProperties: false,
            properties: {
                policySegmentId: {required: true, type: "string", format: 'md5'},
                policyName: {required: true, type: "string", format: "policyName"},
                status: {required: true, type: "integer", minimum: 0, maximum: 1}
            }
        })

        super.addSchema({
            id: "/addPolicySegmentsSchema",
            type: "array",
            uniqueItems: true,
            maxItems: 20,
            items: {$ref: "/addPolicySegmentSchema"}
        })

        super.addSchema({
            id: "/addPolicySegmentSchema",
            type: "object",
            additionalProperties: false,
            properties: {
                policyName: {required: true, type: "string", format: "policyName"},
                policyText: {required: true, type: "string", format: 'base64'}
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
            console.log(input, input.length, input.length >= 2 && input.length < 20)
            return input.length >= 2 && input.length < 20
        })
    }

}

module.exports = new BatchOperationPolicyJsonSchemaValidator()

