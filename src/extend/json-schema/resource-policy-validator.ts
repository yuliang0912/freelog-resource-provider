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
    validate(operations: object[], mode: 'addPolicy' | 'updatePolicy'): ValidatorResult {
        const schemaId = mode === 'addPolicy' ? '/addPolicySchema' : '/updatePolicySchema';
        return super.validate(operations, super.getSchema(schemaId));
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
            id: '/addPolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyName: {required: true, minLength: 1, maxLength: 20, type: 'string', format: 'policyName'},
                    policyText: {required: true, type: 'string'},
                    status: {required: false, type: 'integer', enum: [0, 1], minimum: 0, maximum: 1}
                }
            }
        });

        /**
         * 修改策略格式
         */
        super.addSchema({
            id: '/updatePolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyId: {required: true, type: 'string', format: 'md5'},
                    // 目前只允许修改上线下状态,名字暂时锁住不让修改
                    status: {required: true, type: 'integer', enum: [0, 1], minimum: 0, maximum: 1}
                }
            }
        });
    }
}
