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
exports.ResourceUpcastValidator = ResourceUpcastValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdXBjYXN0LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtdXBjYXN0LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMsc0dBQXNHO0FBSXRHLElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXdCLFNBQVEsdUJBQXVCO0lBRWhFOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsVUFBb0I7UUFDekIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsa0JBQWtCO1FBRWQsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSx1QkFBdUI7WUFDM0IsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO2lCQUN4RTthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUFoQkc7SUFEQyxhQUFJLEVBQUU7Ozs7aUVBZ0JOO0FBL0JRLHVCQUF1QjtJQUZuQyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMseUJBQXlCLENBQUM7R0FDdEIsdUJBQXVCLENBZ0NuQztBQWhDWSwwREFBdUIifQ==