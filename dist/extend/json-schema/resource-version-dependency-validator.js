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
// @ts-ignore
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceVersionDependencyValidator = class ResourceVersionDependencyValidator extends egg_freelog_base_1.CommonJsonSchema {
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
        return super.validate(operations, this.schemas['/resourceDependencySchema']);
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
exports.ResourceVersionDependencyValidator = ResourceVersionDependencyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFDakMsbUNBQTRDO0FBRTVDLGFBQWE7QUFDYix1REFBc0U7QUFJdEUsSUFBYSxrQ0FBa0MsR0FBL0MsTUFBYSxrQ0FBbUMsU0FBUSxtQ0FBZ0I7SUFBeEU7O1FBRUksa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBd0M5QixDQUFDO0lBdENHOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsVUFBb0I7UUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRDs7O09BR0c7SUFFSCxrQkFBa0I7UUFFZCxLQUFLLENBQUMscUJBQXFCLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQixPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osRUFBRSxFQUFFLDJCQUEyQjtZQUMvQixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxvQkFBb0IsRUFBRSxLQUFLO2dCQUMzQixVQUFVLEVBQUU7b0JBQ1IsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUM7b0JBQ3JFLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFDO2lCQUV6RTthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUF2Qkc7SUFEQyxhQUFJLEVBQUU7Ozs7NEVBdUJOO0FBekNRLGtDQUFrQztJQUY5QyxjQUFLLENBQUMsV0FBVyxDQUFDO0lBQ2xCLGdCQUFPLENBQUMsb0NBQW9DLENBQUM7R0FDakMsa0NBQWtDLENBMEM5QztBQTFDWSxnRkFBa0MifQ==