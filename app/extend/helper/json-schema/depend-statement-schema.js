/**
 * Created by yuliang on 2017/11/8.
 */

'use strict'

const JsonSchemaValidator = require('jsonschema').Validator
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')


let jsonSchemaValidator = new JsonSchemaValidator();

let dependStatementSchema = {
    id: "/dependStatementSchema",
    type: "object",
    properties: {
        resourceOneId: {type: "string", format: 'resourceId'},
        resourceTwoId: {type: "string", format: 'resourceId'},
        deep: {type: "integer", minimum: 1, maximum: 100, required: true},
        contractId: {type: "string", format: 'mongoObjectId'},
    }
}

let dependStatementArraySchema = {
    id: "/dependStatementArraySchema",
    type: "array",
    uniqueItems: true,
    items: {$ref: "/dependStatementSchema"}
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
    return input === undefined || input === "" || commonRegex.mongoObjectId.test(input)
}

jsonSchemaValidator.addSchema(dependStatementSchema, '/dependStatementSchema')
jsonSchemaValidator.addSchema(dependStatementArraySchema, '/dependStatementArraySchema')

module.exports = {
    jsonSchemaValidator,
    dependStatementSchema,
    dependStatementArraySchema
}


