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
exports.ResourceCollectionController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let ResourceCollectionController = /** @class */ (() => {
    let ResourceCollectionController = class ResourceCollectionController {
        async index(ctx) {
            const page = ctx.checkQuery('page').default(1).gt(0).toInt().value;
            const pageSize = ctx.checkQuery('pageSize').default(10).gt(0).lt(101).toInt().value;
            const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
            const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
            const resourceStatus = ctx.checkQuery('resourceStatus').optional().toInt().in([0, 1, 2]).value;
            ctx.validateParams();
            await this.resourceCollectionService.findPageList(resourceType, keywords, resourceStatus, page, pageSize).then(ctx.success);
        }
        async create(ctx) {
            const resourceId = ctx.checkBody('resourceId').isMongoObjectId().value;
            ctx.validateParams();
            const resourceInfo = await this.resourceService.findByResourceId(resourceId);
            ctx.entityNullObjectCheck(resourceInfo, {
                msg: ctx.gettext('params-validate-failed', 'resourceId'), data: { resourceId }
            });
            const collectionInfo = {
                resourceId,
                resourceName: resourceInfo.resourceName,
                resourceType: resourceInfo.resourceType,
                authorId: resourceInfo.userId,
                authorName: resourceInfo.username,
                userId: ctx.request.userId
            };
            await this.resourceCollectionService.collectionResource(collectionInfo).then(ctx.success);
        }
        async isCollected(ctx) {
            const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitMongoObjectId().toSplitArray().value;
            ctx.validateParams();
            await this.resourceCollectionService.isCollected(resourceIds).then(ctx.success);
        }
        async show(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            ctx.validateParams();
            await this.resourceCollectionService.findOne({
                resourceId, userId: ctx.request.userId
            }).then(ctx.success).catch(ctx.error);
        }
        async destroy(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            ctx.validateParams();
            await this.resourceCollectionService.deleteOne({
                resourceId, userId: ctx.request.userId
            }).then(ctx.success);
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceCollectionController.prototype, "resourceService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceCollectionController.prototype, "resourceCollectionService", void 0);
    __decorate([
        midway_1.get('/'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceCollectionController.prototype, "index", null);
    __decorate([
        midway_1.post('/'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceCollectionController.prototype, "create", null);
    __decorate([
        midway_1.get('/isCollected'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceCollectionController.prototype, "isCollected", null);
    __decorate([
        midway_1.get('/:resourceId'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceCollectionController.prototype, "show", null);
    __decorate([
        midway_1.del('/:resourceId'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceCollectionController.prototype, "destroy", null);
    ResourceCollectionController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/collections/resources')
    ], ResourceCollectionController);
    return ResourceCollectionController;
})();
exports.ResourceCollectionController = ResourceCollectionController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFtRTtBQUNuRSx1REFBMkQ7QUFDM0Qsa0ZBQXFFO0FBS3JFO0lBQUEsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7UUFTckMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1lBQ1gsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNuRSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNwRixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDMUcsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNsRixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxF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