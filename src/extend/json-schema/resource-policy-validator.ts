import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate} from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';

@scope('Singleton')
@provide('resourcePolicyValidator')
export class ResourcePolicyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {

    /**
     * 策略格式校验
     * @param {object[]} operations 策略信息
     * @param {boolean} isUpdateMode 是否更新模式
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult {
        return super.validate(operations, super.getSchema('/policySchema'));
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
            return input.length >= 2 && input.length < 20;
        });

        /**
         * 新增策略格式
         */
        super.addSchema({
            id: '/policySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyId: {required: true, type: 'string', format: 'md5'},
                    policyName: {required: false, minLength: 1, maxLength: 20, type: 'string', format: 'policyName'},
                    status: {required: false, type: 'integer', minimum: 0, maximum: 1}
                }
            }
        });
    }
}
