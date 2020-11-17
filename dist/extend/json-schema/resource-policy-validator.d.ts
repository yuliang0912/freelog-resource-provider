import { ValidatorResult } from 'jsonschema';
import { IJsonSchemaValidate, CommonJsonSchema } from 'egg-freelog-base';
export declare class ResourcePolicyValidator extends CommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 策略格式校验
     * @param {object[]} operations 策略信息
     * @param {boolean} isUpdateMode 是否更新模式
     * @returns {ValidatorResult}
     */
    validate(operations: object[], ...args: any[]): ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators(): void;
}
