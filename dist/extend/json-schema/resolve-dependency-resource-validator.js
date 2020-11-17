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
exports.ResolveDependencyResourceValidator = void 0;
const midway_1 = require("midway");
// @ts-ignore
const egg_freelog_base_1 = require("egg-freelog-base");
let ResolveDependencyResourceValidator = class ResolveDependencyResourceValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, this.schemas['/resolveResourceSchema']);
    }
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators() {
        super.addSchema({
            id: '/resolveResourceSchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    resourceId: { type: 'string', required: true, format: 'mongoObjectId' },
                    contracts: {
                        type: 'array',
                        uniqueItems: true,
                        required: true,
                        maxItems: 10,
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: true,
                            additionalProperties: false,
                            properties: {
                                policyId: { type: 'string', required: true, format: 'md5' }
                            }
                        }
                    }
                }
            }
        });
        super.addSchema({
            id: '/upcastResourceSchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    resourceId: { type: 'string', required: true, format: 'mongoObjectId' }
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
], ResolveDependencyResourceValidator.prototype, "registerValidators", null);
ResolveDependencyResourceValidator = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('resolveDependencyOrUpcastValidator')
], ResolveDependencyResourceValidator);
exports.ResolveDependencyResourceValidator = ResolveDependencyResourceValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFFNUMsYUFBYTtBQUNiLHVEQUFzRTtBQUt0RSxJQUFhLGtDQUFrQyxHQUEvQyxNQUFhLGtDQUFtQyxTQUFRLG1DQUFnQjtJQUVwRTs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFVBQW9CO1FBQ3pCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVEOzs7T0FHRztJQUVILGtCQUFrQjtRQUVkLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUsd0JBQXdCO1lBQzVCLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLElBQUk7WUFDakIsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2dCQUNkLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLFVBQVUsRUFBRTtvQkFDUixVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBQztvQkFDckUsU0FBUyxFQUFFO3dCQUNQLElBQUksRUFBRSxPQUFPO3dCQUNiLFdBQVcsRUFBRSxJQUFJO3dCQUNqQixRQUFRLEVBQUUsSUFBSTt3QkFDZCxRQUFRLEVBQUUsRUFBRTt3QkFDWixRQUFRLEVBQUUsQ0FBQzt3QkFDWCxLQUFLLEVBQUU7NEJBQ0gsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsUUFBUSxFQUFFLElBQUk7NEJBQ2Qsb0JBQW9CLEVBQUUsS0FBSzs0QkFDM0IsVUFBVSxFQUFFO2dDQUNSLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDOzZCQUM1RDt5QkFDSjtxQkFDSjtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSx1QkFBdUI7WUFDM0IsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO2lCQUN4RTthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUE3Q0c7SUFEQyxhQUFJLEVBQUU7Ozs7NEVBNkNOO0FBNURRLGtDQUFrQztJQUY5QyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsb0NBQW9DLENBQUM7R0FDakMsa0NBQWtDLENBNkQ5QztBQTdEWSxnRkFBa0MifQ==