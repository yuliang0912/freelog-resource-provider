/**
 * Created by yuliang on 2017/11/8.
 */

'use strict'

const JsonSchemaValidator = require('jsonschema').Validator
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')
const jsonSchemaValidator = new JsonSchemaValidator();

const schema = {
    /**
     * 授权点声明解决的部分
     * @returns {{id: string, type: string, properties: {resourceId: {type: string, format: string}, authSchemeId: {type: string, format: string}, statements: {type: string, uniqueItems: boolean, items: {$ref: string}}}}}
     */
    statementSchema() {

        const statementSchema = {
            id: "/statementSchema",
            type: "object",
            properties: {
                resourceId: {type: "string", format: 'resourceId'},
                authSchemeId: {type: "string", format: 'mongoObjectId'},
                policySegmentId: {type: "string", format: 'md5'},
                serialNumber: {type: "string", format: 'mongoObjectId'}
            }
        }

        jsonSchemaValidator.addSchema(statementSchema, '/statementSchema')

        return statementSchema
    },

    /**
     * 声明数组
     * @returns {{id: string, type: string, uniqueItems: boolean, items: {$ref: string}}}
     */
    statementArraySchema() {

        const statementArraySchema = {
            id: "/statementArraySchema",
            type: "array",
            uniqueItems: true,
            items: {$ref: "/statementSchema"}
        }

        jsonSchemaValidator.addSchema(statementArraySchema, '/statementArraySchema')

        return statementArraySchema
    }
}

/**
 * resourceId
 * @param input
 * @returns {*|boolean}
 */
JsonSchemaValidator.prototype.customFormats.resourceId = function (input) {
    return commonRegex.resourceId.test(input)
}

/**
 * mongoObjectId
 * @param input
 * @returns {*|boolean}
 */
JsonSchemaValidator.prototype.customFormats.mongoObjectId = function (input) {
    return commonRegex.mongoObjectId.test(input)
}

/**
 * 是否md5值
 * @param input
 * @returns {boolean}
 */
JsonSchemaValidator.prototype.customFormats.md5 = function (input) {
    return commonRegex.md5.test(input)
}


module.exports = {
    jsonSchemaValidator,
    statementSchema: schema.statementSchema(),
    statementArraySchema: schema.statementArraySchema()
}

