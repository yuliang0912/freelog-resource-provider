import {ValidatorResult} from 'jsonschema';
import {provide, init, scope} from 'midway';
import {IJsonSchemaValidate, CommonJsonSchema} from 'egg-freelog-base';

@scope('Singleton')
@provide('resourcePolicyValidator')
export class ResourcePolicyValidator extends CommonJsonSchema implements IJsonSchemaValidate {

    /**
     * 策略格式校验
     * @param operations
     * @param args
     */
    validate(operations: object[], ...args): ValidatorResult {
        const schemaId = args[0] === 'addPolicy' ? '/addPolicySchema' : '/updatePolicySchema';
        return super.validate(operations, this.schemas[schemaId]);
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
            return input.length >= 2 && input.length <= 20;
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
