import { ValidatorResult } from 'jsonschema';
import { IJsonSchemaValidate } from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
export declare class ResourcePolicyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 策略格式校验
     * @param {object[] | object} operations 策略信息
     * @param {boolean} isUpdateMode 是否更新模式
     * @returns {ValidatorResult}
     */
    validate(operations: object[] | object, isUpdateMode: boolean): ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators(): void;
}
