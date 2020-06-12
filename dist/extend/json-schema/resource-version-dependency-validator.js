"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceVersionDependencyValidator = void 0;
const semver = require("semver");
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let ResourceVersionDependencyValidator = /** @class */ (() => {
    let ResourceVersionDependencyValidator = class ResourceVersionDependencyValidator extends freelogCommonJsonSchema {
        constructor() {
            super(...arguments);
            this.resourceIdSet = new Set();
        }
        /**
         * 依赖资源格式校验
         * @param {object[]} operations 依赖资源数据
         * @returns {ValidatorResult}
         */
        validate(operations) {
            this.resourceIdSet.clear();
            return super.validate(operations, super.getSchema('/resourceDependencySchema'));
        }
        /**
         * 注册所有的校验
         * @private
         */
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
                        resourceId: { type: 'string', required: true, format: 'mongoObjectId' },
                        versionRange: { type: 'string', required: true, format: 'versionRange' },
                    }
                }
            });
        }
    };
    __decorate([
        midway_1.init(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ResourceVersionDependencyValidator.prototype, "registerValidators", null);
    ResourceVersionDependencyValidator = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('resourceVersionDependencyValidator')
    ], ResourceVersionDependencyValidator);
    return ResourceVersionDependencyValidator;
})();
exports.ResourceVersionDependencyValidator = ResourceVersionDependencyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFDakMsbUNBQTRDO0FBRzVDLHNHQUFzRztBQUl0RztJQUFBLElBQWEsa0NBQWtDLEdBQS9DLE1BQWEsa0NBQW1DLFNBQVEsdUJBQXVCO1FBQS9FOztZQUVJLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQXVDOUIsQ0FBQztRQXJDRzs7OztXQUlHO1FBQ0gsUUFBUSxDQUFDLFVBQW9CO1lBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRUQ7OztXQUdHO1FBRUgsa0JBQWtCO1lBRWQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNsRCxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNyQixPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLEVBQUUsRUFBRSwyQkFBMkI7Z0JBQy9CLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLElBQUk7b0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO3dCQUNyRSxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBQztxQkFDekU7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQTtJQXRCRztRQURDLGFBQUksRUFBRTs7OztnRkFzQk47SUF4Q1Esa0NBQWtDO1FBRjlDLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyxvQ0FBb0MsQ0FBQztPQUNqQyxrQ0FBa0MsQ0F5QzlDO0lBQUQseUNBQUM7S0FBQTtBQXpDWSxnRkFBa0MifQ==