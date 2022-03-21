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
    async index() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(1001).value;
        const tagType = ctx.checkQuery('tagType').optional().toInt().in([1, 2]).value;
        const authority = ctx.checkQuery('authority').optional().toInt().in([1, 2, 3]).value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        ctx.validateParams().validateOfficialAuditAccount();
        const condition = (0, freelog_common_func_1.deleteUndefinedFields)({ tagType, authority });
        if (resourceType) {
            condition.resourceRange = resourceType;
        }
        if (keywords?.length) {
            condition.tagName = new RegExp(`^${keywords}`, 'i');
        }
        await this.resourceService.findIntervalResourceTagList(condition, skip, limit, null, { updateDate: -1 }).then(ctx.success);
    }
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
     * 批量更新tag
     */
    async batchUpdateTagInfo() {
        const { ctx } = this;
        const tagIds = ctx.checkBody('tagIds').exist().isArray().len(1, 100).value;
        const tagType = ctx.checkBody('tagType').optional().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').optional().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').optional().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').optional().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        const tagList = await this.resourceService.findResourceTags({ _id: { $in: tagIds } });
        if (!tagList.length) {
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
        await this.resourceService.batchUpdateResourceTag(tagList, model).then(ctx.success);
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
    /**
     * 标签分类
     */
    async tagStatistics() {
        const { ctx } = this;
        const tagIds = ctx.checkQuery('tagIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const tagList = await this.resourceService.findResourceTags({ _id: { $in: tagIds } });
        if (!tagList.length) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed'));
        }
        const tagCountMap = await this.resourceService.tagStatistics(tagList.map(x => x.tagName)).then(list => {
            console.log(list);
            return new Map(list.map(x => [x.tag, parseInt(x.count.toString())]));
        });
        ctx.success(tagList.map(x => {
            return {
                tagId: x.tagId,
                tagName: x.tagName,
                count: tagCountMap.get(x.tagName) ?? 0
            };
        }));
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
    (0, midway_1.get)('/admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "index", null);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "create", null);
__decorate([
    (0, midway_1.put)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "batchUpdateTagInfo", null);
__decorate([
    (0, midway_1.get)('/availableTags'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "list", null);
__decorate([
    (0, midway_1.get)('/statistics'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceTagController.prototype, "tagStatistics", null);
ResourceTagController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.priority)(10),
    (0, midway_1.controller)('/v2/resources/tags')
], ResourceTagController);
exports.ResourceTagController = ResourceTagController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdGFnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL3Jlc291cmNlLXRhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNkU7QUFDN0UsdURBQXdIO0FBRXhILG1DQUErQjtBQUMvQixrRkFBK0U7QUFLL0UsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFHOUIsR0FBRyxDQUFpQjtJQUVwQixlQUFlLENBQW1CO0lBR2xDLEtBQUssQ0FBQyxLQUFLO1FBRVAsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlFLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzlFLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENB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