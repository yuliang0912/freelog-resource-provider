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
exports.ResourceTagController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
const freelog_common_func_1 = require("egg-freelog-base/lib/freelog-common-func");
let ResourceTagController = class ResourceTagController {
    ctx;
    resourceService;
    /**
     * 创建资源tag
     */
    async create() {
        const { ctx } = this;
        const tagName = ctx.checkBody('tagName').exist().len(1, 50).trim().value;
        const tagType = ctx.checkBody('tagType').exist().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').exist().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').exist().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').exist().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        const invalidResourceTypes = resourceRange.filter(x => !egg_freelog_base_1.CommonRegex.resourceType.test(x));
        if (!(0, lodash_1.isEmpty)(invalidResourceTypes)) {
            throw new egg_freelog_base_1.ArgumentError('资源类型范围中存在无效的参数', { invalidResourceTypes });
        }
        const tagInfo = {
            tagName, tagType, resourceRange, resourceRangeType, authority, createUserId: this.ctx.userId
        };
        await this.resourceService.createResourceTag(tagInfo).then(ctx.success);
    }
    /**
     * 创建资源tag
     */
    async updateTagInfo() {
        const { ctx } = this;
        const tagId = ctx.checkParams('tagId').exist().isMongoObjectId().value;
        const tagType = ctx.checkBody('tagType').optional().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').optional().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').optional().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').optional().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        const tagInfo = await this.resourceService.findResourceTags({ _id: tagId }).then(lodash_1.first);
        if (!tagInfo) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed'));
        }
        const model = (0, freelog_common_func_1.deleteUndefinedFields)({
            tagType, resourceRangeType, authority
        });
        if (!(0, lodash_1.isEmpty)(resourceRange ?? [])) {
            model.resourceRange = resourceRange;
        }
        if ((0, lodash_1.isEmpty)(Object.keys(model))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        await this.resourceService.updateResourceTag(tagId, model);
    }
    /**
     * 当前资源类型可用的tags
     */
    async list() {
        const { ctx } = this;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        ctx.validateParams();
        const condition = {
            authority: 1,
            $or: [{ resourceRangeType: 3 },
                { resourceRangeType: 1, resourceRange: resourceType },
                {
                    resourceRangeType: 2,
                    resourceRange: { $ne: resourceType }
                }]
        };
        await this.resourceService.findResourceTags(condition, 'tagName tagType').then(ctx.success);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceTagController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceTagController.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "create", null);
__decorate([
    (0, midway_1.post)('/:tagId'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "updateTagInfo", null);
__decorate([
    (0, midway_1.get)('/availableTags'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "list", null);
ResourceTagController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.priority)(10),
    (0, midway_1.controller)('/v2/resources/tags')
], ResourceTagController);
exports.ResourceTagController = ResourceTagController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdGFnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3Jlc291cmNlLXRhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBd0U7QUFDeEUsdURBQXdIO0FBRXhILG1DQUFzQztBQUN0QyxrRkFBK0U7QUFLL0UsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFHOUIsR0FBRyxDQUFpQjtJQUVwQixlQUFlLENBQW1CO0lBRWxDOztPQUVHO0lBR0gsS0FBSyxDQUFDLE1BQU07UUFFUixNQUFNLEVBQUMsR0FBRyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDekUsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUUsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6RixNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FB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