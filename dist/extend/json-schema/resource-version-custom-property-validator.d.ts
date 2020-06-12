import { ValidatorResult } from 'jsonschema';
import { IJsonSchemaValidate } from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
/**
 * http://json-schema.org/understanding-json-schema/
 */
export declare class ResourceVersionCustomPropertyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 资源自定义属性格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators(): void;
}
