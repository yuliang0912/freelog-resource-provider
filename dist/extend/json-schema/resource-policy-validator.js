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
exports.ResourcePolicyValidator = void 0;
const midway_1 = require("midway");
const application_1 = require("egg-freelog-base/app/extend/application");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let ResourcePolicyValidator = /** @class */ (() => {
    let ResourcePolicyValidator = class ResourcePolicyValidator extends freelogCommonJsonSchema {
        /**
         * 策略格式校验
         * @param {object[] | object} operations 策略信息
         * @param {boolean} isUpdateMode 是否更新模式
         * @returns {ValidatorResult}
         */
        validate(operations, isUpdateMode) {
            const schemeId = isUpdateMode ? '/updateResourcePolicySchema' : '/addResourcePolicySchema';
            return super.validate(operations, super.getSchema(schemeId));
        }
        /**
         * 注册所有的校验
         * @private
         */
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
             * 是否base64
             */
            super.registerCustomFormats('base64', (input) => {
                return application_1.validator.isBase64(input);
            });
            /**
             * 更新策略格式
             */
            super.addSchema({
                id: '/updateResourcePolicySchema',
                type: 'object',
                required: true,
                properties: {
                    additionalProperties: false,
                    addPolicies: { $ref: '/addResourcePolicySchema' },
                    updatePolicies: {
                        type: 'array',
                        uniqueItems: true,
                        maxItems: 20,
                        items: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                policyId: { required: true, type: 'string', format: 'md5' },
                                policyName: {
                                    required: true,
                                    type: 'string',
                                    minLength: 1,
                                    maxLength: 20,
                                    format: 'policyName'
                                },
                                status: { required: true, type: 'integer', minimum: 0, maximum: 1 }
                            }
                        }
                    }
                }
            });
            /**
             * 新增策略格式
             */
            super.addSchema({
                id: '/addResourcePolicySchema',
                type: 'array',
                uniqueItems: true,
                maxItems: 20,
                items: {
                    type: 'object',
                    required: true,
                    additionalProperties: false,
                    properties: {
                        policyName: { required: true, minLength: 1, maxLength: 20, type: 'string', format: 'policyName' },
                        policyText: { required: true, type: 'string', format: 'base64' }
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
    ], ResourcePolicyValidator.prototype, "registerValidators", null);
    ResourcePolicyValidator = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('resourcePolicyValidator')
    ], ResourcePolicyValidator);
    return ResourcePolicyValidator;
})();
exports.ResourcePolicyValidator = ResourcePolicyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMseUVBQWtFO0FBQ2xFLHNHQUFzRztBQUl0RztJQUFBLElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXdCLFNBQVEsdUJBQXVCO1FBRWhFOzs7OztXQUtHO1FBQ0gsUUFBUSxDQUFDLFVBQTZCLEVBQUUsWUFBcUI7WUFDekQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUM7WUFDM0YsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVEOzs7V0FHRztRQUVILGtCQUFrQjtZQUNkOzs7O2VBSUc7WUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hELEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLE9BQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7WUFFSDs7ZUFFRztZQUNILEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDNUMsT0FBTyx1QkFBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVIOztlQUVHO1lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDWixFQUFFLEVBQUUsNkJBQTZCO2dCQUNqQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1Isb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFDO29CQUMvQyxjQUFjLEVBQUU7d0JBQ1osSUFBSSxFQUFFLE9BQU87d0JBQ2IsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLEtBQUssRUFBRTs0QkFDSCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxvQkFBb0IsRUFBRSxLQUFLOzRCQUMzQixVQUFVLEVBQUU7Z0NBQ1IsUUFBUSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7Z0NBQ3pELFVBQVUsRUFBRTtvQ0FDUixRQUFRLEVBQUUsSUFBSTtvQ0FDZCxJQUFJLEVBQUUsUUFBUTtvQ0FDZCxTQUFTLEVBQUUsQ0FBQztvQ0FDWixTQUFTLEVBQUUsRUFBRTtvQ0FDYixNQUFNLEVBQUUsWUFBWTtpQ0FDdkI7Z0NBQ0QsTUFBTSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQzs2QkFDcEU7eUJBQ0o7cUJBQ0o7aUJBQ0o7YUFDSixDQUFDLENBQUM7WUFFSDs7ZUFFRztZQUNILEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ1osRUFBRSxFQUFFLDBCQUEwQjtnQkFDOUIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRTtvQkFDSCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxvQkFBb0IsRUFBRSxLQUFLO29CQUMzQixVQUFVLEVBQUU7d0JBQ1IsVUFBVSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFDO3dCQUMvRixVQUFVLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQztxQkFDakU7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQTtJQXRFRztRQURDLGFBQUksRUFBRTs7OztxRUFzRU47SUF2RlEsdUJBQXVCO1FBRm5DLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyx5QkFBeUIsQ0FBQztPQUN0Qix1QkFBdUIsQ0F3Rm5DO0lBQUQsOEJBQUM7S0FBQTtBQXhGWSwwREFBdUIifQ==