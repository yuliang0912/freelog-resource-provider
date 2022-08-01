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
exports.ResourceOperationController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const resource_operation_service_1 = require("../service/resource-operation-service");
const lodash_1 = require("lodash");
let ResourceOperationController = class ResourceOperationController {
    ctx;
    resourceOperationService;
    resourceService;
    async batchCreate() {
        const { ctx } = this;
        const type = ctx.checkBody('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkBody('resourceIds').exist().len(1, 100).value;
        ctx.validateParams();
        const resourceList = await this.resourceService.find({ _id: { $in: resourceIds } });
        await this.resourceOperationService.createResourceOperationDatas(type, resourceList).then(() => ctx.success(true));
    }
    async batchDelete() {
        const { ctx } = this;
        const type = ctx.checkBody('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkBody('resourceIds').exist().len(1, 100).value;
        ctx.validateParams();
        const resourceList = await this.resourceService.find({ _id: { $in: resourceIds } });
        await this.resourceOperationService.deleteResourceOperationDatas(type, resourceList).then(ctx.success);
    }
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const authorName = ctx.checkQuery('authorName').ignoreParamWhenEmpty().isUsername().value;
        const resourceName = ctx.checkQuery('resourceName').ignoreParamWhenEmpty().value;
        const statusList = ctx.checkQuery('status').optional().ignoreParamWhenEmpty().toSplitArray().len(0, 10).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        ctx.validateParams();
        const condition = {};
        if (resourceType?.length) {
            condition['resourceInfo.resourceType'] = resourceType;
        }
        if (authorName?.length) {
            condition['resourceInfo.username'] = new RegExp(authorName, 'i');
        }
        if (resourceName?.length) {
            condition['resourceInfo.resourceName'] = new RegExp(resourceName, 'i');
        }
        if (statusList?.length) {
            condition['resourceInfo.status'] = { $in: statusList.map(x => parseInt(x)) };
        }
        const pageResult = await this.resourceOperationService.findIntervalListJoinResource(condition, skip, limit, undefined, sort ?? { updateDate: -1 });
        if (!pageResult.dataList.length) {
            return ctx.success(pageResult);
        }
        pageResult.dataList = pageResult.dataList.map(({ resourceInfo }) => {
            resourceInfo.resourceId = resourceInfo._id.toString();
            return (0, lodash_1.omit)(resourceInfo, ['_id', 'uniqueKey']);
        });
        if (isLoadPolicyInfo) {
            await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }
    async list() {
        const { ctx } = this;
        const type = ctx.checkQuery('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 100).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceOperationService.resourceOperationProvider.find({
            type, resourceId: { $in: resourceIds }
        }, projection?.join(' ')).then(ctx.success);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceOperationController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", resource_operation_service_1.ResourceOperationService)
], ResourceOperationController.prototype, "resourceOperationService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceOperationController.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceOperationController.prototype, "batchCreate", null);
__decorate([
    (0, midway_1.put)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceOperationController.prototype, "batchDelete", null);
__decorate([
    (0, midway_1.get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceOperationController.prototype, "index", null);
__decorate([
    (0, midway_1.get)('/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceOperationController.prototype, "list", null);
ResourceOperationController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.priority)(11),
    (0, midway_1.controller)('/v2/resources/operations')
], ResourceOperationController);
exports.ResourceOperationController = ResourceOperationController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utb3BlcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3Jlc291cmNlLW9wZXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNkU7QUFDN0UsdURBQTRGO0FBQzVGLHNGQUErRTtBQUUvRSxtQ0FBNEI7QUFLNUIsSUFBYSwyQkFBMkIsR0FBeEMsTUFBYSwyQkFBMkI7SUFFcEMsR0FBRyxDQUFpQjtJQUVwQix3QkFBd0IsQ0FBMkI7SUFFbkQsZUFBZSxDQUFtQjtJQUlsQyxLQUFLLENBQUMsV0FBVztRQUNiLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdkUsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMzRSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFDaEYsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkgs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