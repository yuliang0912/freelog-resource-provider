'use strict'

const JsonSchemaValidator = require('jsonschema').Validator
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')
const {validator} = require('egg-freelog-base/app/extend/application')
const jsonSchemaValidator = new JsonSchemaValidator();

const schema = {

    /**
     * 授权方案-策略段批量操作校验
     * @returns {{id: string, type: string, properties: {removePolicySegments: {type: string, uniqueItems: boolean, maxItems: number, items: {type: string, format: string}}, addPolicySegments: {type: string, uniqueItems: boolean, maxItems: number, items: {type: string, format: string}}, updatePolicySegments: {type: string, uniqueItems: boolean, maxItems: number, items: {$ref: string}}}}}
     */
    authSchemePolicyValidator() {

        const authSchemePolicyValidatorSchema = {
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
        }

        const updatePolicySegmentSchema = {
            id: "/updatePolicySegmentSchema",
            type: "object",
            additionalProperties: false,
            properties: {
                policySegmentId: {required: true, type: "string", format: 'md5'},
                policyName: {required: true, type: "string", format: "policyName"},
                policyText: {required: true, type: "string", format: 'base64'}
            }
        }

        jsonSchemaValidator.addSchema(updatePolicySegmentSchema, '/updatePolicySegmentSchema')
        jsonSchemaValidator.addSchema(authSchemePolicyValidatorSchema, '/authSchemePolicyValidatorSchema')

        return authSchemePolicyValidatorSchema
    },

    /**
     * 批量新增策略段校验
     */
    addPolicySegmentsValidator() {

        const addPolicySegmentsSchema = {
            id: "/addPolicySegmentsSchema",
            type: "array",
            uniqueItems: true,
            maxItems: 20,
            items: {$ref: "/addPolicySegmentSchema"}
        }

        const addPolicySegmentSchema = {
            id: "/addPolicySegmentSchema",
            type: "object",
            additionalProperties: false,
            properties: {
                policyName: {required: true, type: "string", format: "policyName"},
                policyText: {required: true, type: "string", format: 'base64'}
            }
        }

        jsonSchemaValidator.addSchema(addPolicySegmentSchema, '/addPolicySegmentSchema')
        jsonSchemaValidator.addSchema(addPolicySegmentsSchema, '/addPolicySegmentsSchema')

        return addPolicySegmentsSchema
    }
}

/**
 * 是否md5值
 * @param input
 * @returns {boolean}
 */
JsonSchemaValidator.prototype.customFormats.md5 = function (input) {
    return commonRegex.md5.test(input)
}

/**
 * mongoObjectId
 * @param input
 * @returns {*|boolean}
 */
JsonSchemaValidator.prototype.customFormats.base64 = function (input) {
    return validator.isBase64(input)
}

/**
 * 策略名称
 * @param input
 * @returns {boolean}
 */
JsonSchemaValidator.prototype.customFormats.policyName = function (input) {
    return input.length > 2 && input.length < 20
}

module.exports = {
    jsonSchemaValidator,
    authSchemePolicyValidator: schema.authSchemePolicyValidator(),
    addPolicySegmentsValidator: schema.addPolicySegmentsValidator()
}

