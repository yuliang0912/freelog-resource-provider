import * as semver from 'semver';
import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
import {IJsonSchemaValidate} from '../../interface';
import * as freelogCommonJsonSchema from 'egg-freelog-base/app/extend/json-schema/common-json-schema';

@scope('Singleton')
@provide('resourceVersionDependencyValidator')
export class ResourceVersionDependencyValidator extends freelogCommonJsonSchema implements IJsonSchemaValidate {

    resourceIdSet = new Set();

    /**
     * 依赖资源格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult {
        this.resourceIdSet.clear();
        return super.validate(operations, super.getSchema('/resourceDependencySchema'));
    }

    /**
     * 注册所有的校验
     * @private
     */
    @init()
    registerValidators() {

        super.registerCustomFormats('versionRange', (input) => {
            input = input.trim();
            return semver.validRange(input);
        });

        super.addSchema({
            id: '/resourceDependencySchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    resourceId: {type: 'string', required: true, format: 'mongoObjectId'},
                    versionRange: {type: 'string', required: true, format: 'versionRange'},
                }
            }
        });
    }
}
