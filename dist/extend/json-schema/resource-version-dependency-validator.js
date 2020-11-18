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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvcmVzb3VyY2UtdmVyc2lvbi1kZXBlbmRlbmN5LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFFakMsbUNBQTRDO0FBQzVDLHVEQUFzRTtBQUl0RSxJQUFhLGtDQUFrQyxHQUEvQyxNQUFhLGtDQUFtQyxTQUFRLG1DQUFnQjtJQUF4RTs7UUFFSSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUF3QzlCLENBQUM7SUF0Q0c7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxVQUFvQjtRQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVEOzs7T0FHRztJQUVILGtCQUFrQjtRQUVkLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNsRCxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUsMkJBQTJCO1lBQy9CLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLElBQUk7WUFDakIsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxJQUFJO2dCQUNkLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLFVBQVUsRUFBRTtvQkFDUixVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBQztvQkFDckUsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUM7aUJBRXpFO2FBQ0o7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQTtBQXZCRztJQURDLGFBQUksRUFBRTs7Ozs0RUF1Qk47QUF6Q1Esa0NBQWtDO0lBRjlDLGNBQUssQ0FBQyxXQUFXLENBQUM7SUFDbEIsZ0JBQU8sQ0FBQyxvQ0FBb0MsQ0FBQztHQUNqQyxrQ0FBa0MsQ0EwQzlDO0FBMUNZLGdGQUFrQyJ9