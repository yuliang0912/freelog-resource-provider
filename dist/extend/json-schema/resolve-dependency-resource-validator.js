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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBNEM7QUFDNUMsdURBQXNFO0FBS3RFLElBQWEsa0NBQWtDLEdBQS9DLE1BQWEsa0NBQW1DLFNBQVEsbUNBQWdCO0lBRXBFOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsVUFBb0I7UUFDekIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsa0JBQWtCO1FBRWQsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSx3QkFBd0I7WUFDNUIsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO29CQUNyRSxTQUFTLEVBQUU7d0JBQ1AsSUFBSSxFQUFFLE9BQU87d0JBQ2IsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFFBQVEsRUFBRSxJQUFJO3dCQUNkLFFBQVEsRUFBRSxFQUFFO3dCQUNaLFFBQVEsRUFBRSxDQUFDO3dCQUNYLEtBQUssRUFBRTs0QkFDSCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxRQUFRLEVBQUUsSUFBSTs0QkFDZCxvQkFBb0IsRUFBRSxLQUFLOzRCQUMzQixVQUFVLEVBQUU7Z0NBQ1IsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7NkJBQzVEO3lCQUNKO3FCQUNKO2lCQUNKO2FBQ0o7U0FDSixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osRUFBRSxFQUFFLHVCQUF1QjtZQUMzQixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixVQUFVLEVBQUU7b0JBQ1IsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUM7aUJBQ3hFO2FBQ0o7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQTtBQTdDRztJQURDLGFBQUksRUFBRTs7Ozs0RUE2Q047QUE1RFEsa0NBQWtDO0lBRjlDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxvQ0FBb0MsQ0FBQztHQUNqQyxrQ0FBa0MsQ0E2RDlDO0FBN0RZLGdGQUFrQyJ9