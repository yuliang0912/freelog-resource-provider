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
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let ResolveDependencyResourceValidator = /** @class */ (() => {
    let ResolveDependencyResourceValidator = class ResolveDependencyResourceValidator extends freelogCommonJsonSchema {
        /**
         * 解决依赖资源格式校验
         * @param {object[]} operations 解决依赖资源数据
         * @returns {ValidatorResult}
         */
        validate(operations) {
            return super.validate(operations, super.getSchema('/resolveResourceSchema'));
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
    return ResolveDependencyResourceValidator;
})();
exports.ResolveDependencyResourceValidator = ResolveDependencyResourceValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb2x2ZS1kZXBlbmRlbmN5LXJlc291cmNlLXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMsc0dBQXNHO0FBSXRHO0lBQUEsSUFBYSxrQ0FBa0MsR0FBL0MsTUFBYSxrQ0FBbUMsU0FBUSx1QkFBdUI7UUFFM0U7Ozs7V0FJRztRQUNILFFBQVEsQ0FBQyxVQUFvQjtZQUN6QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFRDs7O1dBR0c7UUFFSCxrQkFBa0I7WUFFZCxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLEVBQUUsRUFBRSx3QkFBd0I7Z0JBQzVCLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLElBQUk7b0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO3dCQUNyRSxTQUFTLEVBQUU7NEJBQ1AsSUFBSSxFQUFFLE9BQU87NEJBQ2IsV0FBVyxFQUFFLElBQUk7NEJBQ2pCLFFBQVEsRUFBRSxJQUFJOzRCQUNkLFFBQVEsRUFBRSxFQUFFOzRCQUNaLFFBQVEsRUFBRSxDQUFDOzRCQUNYLEtBQUssRUFBRTtnQ0FDSCxJQUFJLEVBQUUsUUFBUTtnQ0FDZCxRQUFRLEVBQUUsSUFBSTtnQ0FDZCxvQkFBb0IsRUFBRSxLQUFLO2dDQUMzQixVQUFVLEVBQUU7b0NBQ1IsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7aUNBQzVEOzZCQUNKO3lCQUNKO3FCQUNKO2lCQUNKO2FBQ0osQ0FBQyxDQUFDO1lBRUgsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDWixFQUFFLEVBQUUsdUJBQXVCO2dCQUMzQixJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsSUFBSTtnQkFDakIsS0FBSyxFQUFFO29CQUNILElBQUksRUFBRSxRQUFRO29CQUNkLFFBQVEsRUFBRSxJQUFJO29CQUNkLG9CQUFvQixFQUFFLEtBQUs7b0JBQzNCLFVBQVUsRUFBRTt3QkFDUixVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBQztxQkFDeEU7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQTtJQTdDRztRQURDLGFBQUksRUFBRTs7OztnRkE2Q047SUE1RFEsa0NBQWtDO1FBRjlDLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyxvQ0FBb0MsQ0FBQztPQUNqQyxrQ0FBa0MsQ0E2RDlDO0lBQUQseUNBQUM7S0FBQTtBQTdEWSxnRkFBa0MifQ==