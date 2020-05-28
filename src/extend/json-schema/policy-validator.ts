import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
import {IJsonSchemaValidate} from '../../interface';
import {validator} from 'egg-freelog-base/app/extend/application';

@scope('Singleton')
@provide('userNodeDataEditValidator')
export class PolicyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 用户节点数据操作校验
     * @param operations
     * @returns {ValidatorResult}
     */
    validate(operations): ValidatorResult {
        return super.validate(operations, super.getSchema('/keyValuePairArraySchema'));
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    __registerValidators__() {

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
}
