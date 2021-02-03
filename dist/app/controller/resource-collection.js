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
let ResourceCollectionController = class ResourceCollectionController {
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const resourceStatus = ctx.checkQuery('resourceStatus').optional().toInt().in([0, 1, 2]).value;
        ctx.validateParams();
        await this.resourceCollectionService.findIntervalList(resourceType, omitResourceType, keywords, resourceStatus, skip, limit).then(ctx.success);
    }
    async create() {
        const { ctx } = this;
        const resourceId = ctx.checkBody('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'),
            data: { resourceId }
        });
        const collectionInfo = {
            resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            authorId: resourceInfo.userId,
            authorName: resourceInfo.username,
            userId: ctx.userId
        };
        await this.resourceCollectionService.collectionResource(collectionInfo).then(ctx.success);
    }
    async isCollected() {
        const { ctx } = this;
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitMongoObjectId().toSplitArray().value;
        ctx.validateParams();
        await this.resourceCollectionService.isCollected(resourceIds).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        await this.resourceCollectionService.findOne({
            resourceId, userId: ctx.userId
        }).then(ctx.success).catch(ctx.error);
    }
    async destroy() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        await this.resourceCollectionService.deleteOne({
            resourceId, userId: ctx.userId
        }).then(ctx.success);
    }
    async count() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        await this.resourceCollectionService.count({ resourceId }).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceCollectionController.prototype, "ctx", void 0);
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
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "index", null);
__decorate([
    midway_1.post('/'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "create", null);
__decorate([
    midway_1.get('/isCollected'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "isCollected", null);
__decorate([
    midway_1.get('/:resourceId'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "show", null);
__decorate([
    midway_1.del('/:resourceId'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "destroy", null);
__decorate([
    midway_1.get('/:resourceId/count'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceCollectionController.prototype, "count", null);
ResourceCollectionController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/collections/resources')
], ResourceCollectionController);
exports.ResourceCollectionController = ResourceCollectionController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFtRTtBQUVuRSx1REFBNEY7QUFJNUYsSUFBYSw0QkFBNEIsR0FBekMsTUFBYSw0QkFBNEI7SUFXckMsS0FBSyxDQUFDLEtBQUs7UUFDUCxNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekYsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMxRyxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMxRyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENB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