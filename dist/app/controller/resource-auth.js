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
exports.ResourceAuthController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let ResourceAuthController = class ResourceAuthController {
    async resourceAuth(ctx) {
        // const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        // const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        ctx.validateParams();
    }
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供
    async subjectContractAuth(ctx) {
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        /**
         * TODO:直接根据合约查询授权状态即可.
         */
        ctx.success(contractIds, resourceId);
    }
};
__decorate([
    midway_1.get('/:subjectId/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceAuth", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient),
    midway_1.get('/:subjectId/contractAuth/content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "subjectContractAuth", null);
ResourceAuthController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/auths/resource')
], ResourceAuthController);
exports.ResourceAuthController = ResourceAuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFnRDtBQUNoRCx1REFBZ0Q7QUFDaEQsa0ZBQXFFO0FBSXJFLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBRy9CLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRztRQUNsQix3RUFBd0U7UUFDeEUsb0VBQW9FO1FBQ3BFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsaURBQWlEO0lBQ2pELHFCQUFxQjtJQUdyQixLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRztRQUV6QixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDckgsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCOztXQUVHO1FBQ0gsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekMsQ0FBQztDQUNKLENBQUE7QUFyQkc7SUFEQyxZQUFHLENBQUMsb0JBQW9CLENBQUM7Ozs7MERBS3pCO0FBTUQ7SUFGQyx5Q0FBZSxDQUFDLGlDQUFjLENBQUM7SUFDL0IsWUFBRyxDQUFDLGtDQUFrQyxDQUFDOzs7O2lFQVd2QztBQXZCUSxzQkFBc0I7SUFGbEMsZ0JBQU8sRUFBRTtJQUNULG1CQUFVLENBQUMsb0JBQW9CLENBQUM7R0FDcEIsc0JBQXNCLENBd0JsQztBQXhCWSx3REFBc0IifQ==