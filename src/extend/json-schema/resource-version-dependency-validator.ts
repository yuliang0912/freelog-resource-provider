import * as semver from 'semver';
import {provide, init, scope} from 'midway';
import {ValidatorResult} from 'jsonschema';
// @ts-ignore
import {IJsonSchemaValidate, CommonJsonSchema} from 'egg-freelog-base'

@scope('Singleton')
@provide('resourceVersionDependencyValidator')
export class ResourceVersionDependencyValidator extends CommonJsonSchema implements IJsonSchemaValidate {

    resourceIdSet = new Set();

    /**
     * 依赖资源格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations: object[]): ValidatorResult {
        this.resourceIdSet.clear();
        return super.validate(operations, this.schemas['/resourceDependencySchema']);
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
                    // versionRangeType: {type: 'integer', required: false, enum: [1, 2]},
                }
            }
        });
    }
}
