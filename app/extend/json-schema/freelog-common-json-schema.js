'use strict'

const JsonSchemaValidator = require('jsonschema').Validator
const initialFnName = Symbol("FreelogCommonJsonSchema#initial")
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')
const validator = require('egg-freelog-base/app/extend/application').validator

module.exports = class FreelogCommonJsonSchema extends JsonSchemaValidator {

    constructor() {
        super()
        this[initialFnName]()
    }

    /**
     * 注册freelog默认的自定义格式
     * @returns {*}
     * @private
     */
    [initialFnName]() {
        this.customFormats = {

            /**
             * 是否是md5格式
             * @param input
             * @returns {Promise<void>|boolean}
             */
            md5(input) {
                return commonRegex.md5.test(input)
            },

            /**
             * 是否是base64格式
             * @param input
             * @returns {*}
             */
            base64(input) {
                return validator.isBase64(input)
            },

            /**
             * 是否是mongoDB的主键ID格式
             * @param input
             * @returns {Promise<void>|boolean}
             */
            mongoObjectId(input) {
                return commonRegex.mongoObjectId.test(input)
            },

            /**
             * 是否是sha1值
             * @param input
             * @returns {Promise<void>|boolean}
             */
            resourceId(input) {
                return commonRegex.resourceId.test(input)
            }
        }
    }


    /**
     * 注册自定义格式校验函数
     * @param formatName
     * @param fn
     */
    registerCustomFormats(formatName, fn) {

        if (toString.call(formatName) !== "[object String]") {
            throw new Error("args[0] must be string")
        }

        if (toString.call(fn) !== "[object Function]") {
            throw new Error("args[1] must be function")
        }

        this.customFormats[formatName] = fn
    }
}


