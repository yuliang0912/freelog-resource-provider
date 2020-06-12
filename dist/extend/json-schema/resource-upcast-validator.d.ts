import { ValidatorResult } from 'jsonschema';
import { IJsonSchemaValidate } from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';
export declare class ResourceUpcastValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {
    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult;
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators(): void;
}
