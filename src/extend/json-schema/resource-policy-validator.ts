import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate} from '../../interface';
import {validator} from 'egg-freelog-base/app/extend/application';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';

@scope('Singleton')
@provide('resourcePolicyValidator')
export class ResourcePolicyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {

    /**
     * 策略格式校验
     * @param {object[] | object} operations 策略信息
     * @param {boolean} isUpdateMode 是否更新模式
     * @returns {ValidatorResult}
     */
    validate(operations: object[] | object, isUpdateMode: boolean): ValidatorResult {
        const schemeId = isUpdateMode ? '/updateResourcePolicySchema' : '/addResourcePolicySchema';
        return super.validate(operations, super.getSchema(schemeId));
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    registerValidators() {
        /**
         * 策略名称格式
         * @param input
         * @returns {boolean}
         */
        super.registerCustomFormats('policyName', (input) => {
            input = input.trim();
            return input.length >= 2 && input.length < 20
        });

        /**
         * 是否base64
         */
        super.registerCustomFormats('base64', (input) => {
            return validator.isBase64(input)
        });

        /**
         * 更新策略格式
         */
        super.addSchema({
            id: "/updateResourcePolicySchema",
            type: "object",
            required: true,
            properties: {
                additionalProperties: false,
                addPolicies: {$ref: "/addResourcePolicySchema"},
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
        });

        /**
         * 新增策略格式
         */
        super.addSchema({
            id: "/addResourcePolicySchema",
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
        });
    }
}
