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
// @ts-ignore
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourcePolicyValidator = class ResourcePolicyValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 策略格式校验
     * @param {object[]} operations 策略信息
     * @param {boolean} isUpdateMode 是否更新模式
     * @returns {ValidatorResult}
     */
    validate(operations, ...args) {
        const schemaId = args[0] === 'addPolicy' ? '/addPolicySchema' : '/updatePolicySchema';
        return super.validate(operations, this.schemas[schemaId]);
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
         * 新增策略格式
         */
        super.addSchema({
            id: '/addPolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyName: { required: true, minLength: 1, maxLength: 20, type: 'string', format: 'policyName' },
                    policyText: { required: true, type: 'string' },
                    status: { required: false, type: 'integer', enum: [0, 1], minimum: 0, maximum: 1 }
                }
            }
        });
        /**
         * 修改策略格式
         */
        super.addSchema({
            id: '/updatePolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyId: { required: true, type: 'string', format: 'md5' },
                    // 目前只允许修改上线下状态,名字暂时锁住不让修改
                    status: { required: true, type: 'integer', enum: [0, 1], minimum: 0, maximum: 1 }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtcG9saWN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFFNUMsYUFBYTtBQUNiLHVEQUFzRTtBQUl0RSxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF3QixTQUFRLG1DQUFnQjtJQUV6RDs7Ozs7T0FLRztJQUNILFFBQVEsQ0FBQyxVQUFvQixFQUFFLEdBQUcsSUFBSTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDdEYsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7T0FHRztJQUVILGtCQUFrQjtRQUNkOzs7O1dBSUc7UUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDaEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osRUFBRSxFQUFFLGtCQUFrQjtZQUN0QixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFFBQVEsRUFBRSxFQUFFO1lBQ1osS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2dCQUNkLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLFVBQVUsRUFBRTtvQkFDUixVQUFVLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUM7b0JBQy9GLFVBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztvQkFDNUMsTUFBTSxFQUFFLEVBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUM7aUJBQ25GO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSDs7V0FFRztRQUNILEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUscUJBQXFCO1lBQ3pCLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLElBQUk7WUFDakIsUUFBUSxFQUFFLEVBQUU7WUFDWixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO29CQUN6RCwwQkFBMEI7b0JBQzFCLE1BQU0sRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDO2lCQUNsRjthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUFuREc7SUFEQyxhQUFJLEVBQUU7Ozs7aUVBbUROO0FBcEVRLHVCQUF1QjtJQUZuQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMseUJBQXlCLENBQUM7R0FDdEIsdUJBQXVCLENBcUVuQztBQXJFWSwwREFBdUIifQ==