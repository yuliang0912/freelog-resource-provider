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
exports.ResourceUpcastValidator = void 0;
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let ResourceUpcastValidator = /** @class */ (() => {
    let ResourceUpcastValidator = class ResourceUpcastValidator extends freelogCommonJsonSchema {
        /**
         * 解决依赖资源格式校验
         * @param {object[]} operations 解决依赖资源数据
         * @returns {ValidatorResult}
         */
        validate(operations) {
            return super.validate(operations, super.getSchema('/upcastResourceSchema'));
        }
        /**
         * 注册所有的校验
         * @private
         */
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
    ], ResourceUpcastValidator.prototype, "registerValidators", null);
    ResourceUpcastValidator = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('resourceUpcastValidator')
    ], ResourceUpcastValidator);
    return ResourceUpcastValidator;
})();
exports.ResourceUpcastValidator = ResourceUpcastValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdXBjYXN0LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtdXBjYXN0LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMsc0dBQXNHO0FBSXRHO0lBQUEsSUFBYSx1QkFBdUIsR0FBcEMsTUFBYSx1QkFBd0IsU0FBUSx1QkFBdUI7UUFFaEU7Ozs7V0FJRztRQUNILFFBQVEsQ0FBQyxVQUFvQjtZQUN6QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRDs7O1dBR0c7UUFFSCxrQkFBa0I7WUFFZCxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLEVBQUUsRUFBRSx1QkFBdUI7Z0JBQzNCLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLElBQUk7b0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO3FCQUN4RTtpQkFDSjthQUNKLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSixDQUFBO0lBaEJHO1FBREMsYUFBSSxFQUFFOzs7O3FFQWdCTjtJQS9CUSx1QkFBdUI7UUFGbkMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLHlCQUF5QixDQUFDO09BQ3RCLHVCQUF1QixDQWdDbkM7SUFBRCw4QkFBQztLQUFBO0FBaENZLDBEQUF1QiJ9