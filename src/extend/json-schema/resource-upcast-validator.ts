import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate} from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';

@scope('Singleton')
@provide('resourceUpcastValidator')
export class ResourceUpcastValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {

    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult {
        return super.validate(operations, super.getSchema('/upcastResourceSchema'));
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    registerValidators() {

        super.addSchema({
            id: '/upcastResourceSchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    resourceId: {type: 'string', required: true, format: 'mongoObjectId'}
                }
            }
        });
    }
}
