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
                                minLength: 2,
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
exports.ResourcePolicyValidator = ResourcePolicyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMseUVBQWtFO0FBQ2xFLHNHQUFzRztBQUl0RyxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF3QixTQUFRLHVCQUF1QjtJQUVoRTs7Ozs7T0FLRztJQUNILFFBQVEsQ0FBQyxVQUE2QixFQUFFLFlBQXFCO1FBQ3pELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDO1FBQzNGLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7O09BR0c7SUFFSCxrQkFBa0I7UUFDZDs7OztXQUlHO1FBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2hELEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsRCxDQUFDLENBQUMsQ0FBQztRQUVIOztXQUVHO1FBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzVDLE9BQU8sdUJBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSDs7V0FFRztRQUNILEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUsNkJBQTZCO1lBQ2pDLElBQUksRUFBRSxRQUFRO1lBQ2QsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUU7Z0JBQ1Isb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFDO2dCQUMvQyxjQUFjLEVBQUU7b0JBQ1osSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFFBQVEsRUFBRSxFQUFFO29CQUNaLEtBQUssRUFBRTt3QkFDSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxvQkFBb0IsRUFBRSxLQUFLO3dCQUMzQixVQUFVLEVBQUU7NEJBQ1IsUUFBUSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7NEJBQ3pELFVBQVUsRUFBRTtnQ0FDUixRQUFRLEVBQUUsSUFBSTtnQ0FDZCxJQUFJLEVBQUUsUUFBUTtnQ0FDZCxTQUFTLEVBQUUsQ0FBQztnQ0FDWixTQUFTLEVBQUUsRUFBRTtnQ0FDYixNQUFNLEVBQUUsWUFBWTs2QkFDdkI7NEJBQ0QsTUFBTSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQzt5QkFDcEU7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUVIOztXQUVHO1FBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSwwQkFBMEI7WUFDOUIsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixRQUFRLEVBQUUsRUFBRTtZQUNaLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixVQUFVLEVBQUU7b0JBQ1IsVUFBVSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFDO29CQUMvRixVQUFVLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQztpQkFDakU7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBdEVHO0lBREMsYUFBSSxFQUFFOzs7O2lFQXNFTjtBQXZGUSx1QkFBdUI7SUFGbkMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHlCQUF5QixDQUFDO0dBQ3RCLHVCQUF1QixDQXdGbkM7QUF4RlksMERBQXVCIn0=