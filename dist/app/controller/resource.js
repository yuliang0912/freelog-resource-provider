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
exports.ResourceController = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const lodash_1 = require("lodash");
const semver = require("semver");
let ResourceController = /** @class */ (() => {
    let ResourceController = class ResourceController {
        async index(ctx) {
            const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
            const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
            const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
            const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
            const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
            const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
            ctx.validateParams();
            const condition = {};
            if (isSelf) {
                ctx.validateVisitorIdentity(egg_freelog_base_1.LoginUser);
                condition.userId = ctx.request.userId;
            }
            if (resourceType) {
                condition.resourceType = resourceType;
            }
            if (lodash_1.includes([0, 1], status)) {
                condition.status = status;
            }
            if (lodash_1.isString(keywords) && keywords.length > 0) {
                const searchRegExp = new RegExp(keywords, 'i');
                condition.$or = [{ releaseName: searchRegExp }, { resourceType: searchRegExp }];
            }
            let dataList = [];
            const totalItem = await this.resourceService.count(condition);
            if (totalItem <= (page - 1) * pageSize) {
                return ctx.success({ page, pageSize, totalItem, dataList });
            }
            dataList = await this.resourceService.findPageList(condition, page, pageSize, projection, { createDate: -1 });
            if (!isLoadLatestVersionInfo) {
                return ctx.success({ page, pageSize, totalItem, dataList });
            }
            const versionIds = dataList.filter(x => !lodash_1.isEmpty(x.resourceVersions)).map(resourceInfo => {
                const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
                resourceInfo.latestVersionId = versionId;
                return versionId;
            });
            if (!lodash_1.isEmpty(versionIds)) {
                const versionInfos = await this.resourceVersionService.find({ versionId: { $in: versionIds } });
                dataList = dataList.map(item => {
                    const latestVersionInfo = versionInfos.find(x => x.versionId === item.latestVersionId);
                    item = item.toObject();
                    item.latestVersionInfo = latestVersionInfo;
                    return item;
                });
            }
            return ctx.success({ page, pageSize, totalItem, dataList });
        }
        /**
         * 创建资源,区别于旧版本,现在资源可以先创建,后添加版本.
         * 只有具有正式版本,且具有策略,才代表资源上架
         * @param ctx
         * @returns {Promise<void>}
         */
        async create(ctx) {
            const name = ctx.checkBody('name').exist().isReleaseName().value;
            const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
            const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
            const intro = ctx.checkBody('intro').optional().type('string').default('').len(0, 1000).value;
            const coverImages = ctx.checkBody('coverImages').optional().isArray().len(1, 10).default([]).value;
            const tags = ctx.checkBody('tags').optional().isArray().len(1, 20).default([]).value;
            ctx.validateParams();
            if (coverImages.some(x => !ctx.app.validator.isURL(x.toString(), { protocols: ['https'] }))) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
            }
            const policyValidateResult = await this.resourcePolicyValidator.validate(policies);
            if (!lodash_1.isEmpty(policyValidateResult.errors)) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                    errors: policyValidateResult.errors
                });
            }
            const { userId, username } = ctx.request.identityInfo.userInfo;
            const model = {
                userId, username, resourceType, name, intro, coverImages, policies, tags
            };
            await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(resourceName => {
                if (resourceName) {
                    throw new egg_freelog_base_1.ArgumentError('name is already existing');
                }
            });
            await this.resourceService.createResource(model).then(ctx.success);
        }
        async list(ctx) {
            const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
            const resourceNames = ctx.checkQuery('resourceNames').optional().toSplitArray().value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            ctx.validateParams();
            if (!lodash_1.isEmpty(resourceIds)) {
                await this.resourceService.find({ _id: { $in: resourceIds } }, projection.join(' ')).then(ctx.success);
            }
            else if (!lodash_1.isEmpty(resourceNames)) {
                await this.resourceService.findByResourceNames(resourceNames, projection.join(' ')).then(ctx.success);
            }
            else {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
            }
        }
        async detail(ctx) {
            const resourceName = ctx.checkQuery('resourceName').exist().isFullReleaseName().value;
            const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
            ctx.validateParams();
            let resourceInfo = await this.resourceService.findOneByResourceName(resourceName);
            if (!resourceInfo) {
                return ctx.success(null);
            }
            resourceInfo = resourceInfo.toObject();
            if (isLoadLatestVersionInfo && resourceInfo.latestVersion) {
                const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
                resourceInfo.latestVersionInfo = await this.resourceVersionService.findOne({ versionId });
            }
            ctx.success(resourceInfo);
        }
        async update(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            const policyChangeInfo = ctx.checkBody('policyChangeInfo').optional().isObject().value;
            const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
            const coverImages = ctx.checkBody('coverImages').optional().isArray().len(1, 10).value;
            const tags = ctx.checkBody('tags').optional().isArray().len(1, 20).value;
            ctx.validateParams();
            if ([policyChangeInfo, intro, coverImages].every(x => x === undefined)) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
            }
            if (!lodash_1.isEmpty(coverImages) && coverImages.some(x => !ctx.app.validator.isURL(x.toString(), { protocols: ['https'] }))) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'));
            }
            const resourceInfo = await this.resourceService.findOne({ _id: resourceId });
            ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
            const updateResourceOptions = {
                resourceId, intro, coverImages, policyChangeInfo, tags
            };
            await this.resourceService.updateResource(updateResourceOptions).then(ctx.success);
        }
        async dependencyTree(ctx) {
            const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
            const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
            const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
            const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
            const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
            ctx.validateParams();
            const resourceInfo = await this.resourceService.findByResourceId(resourceId);
            ctx.entityNullObjectCheck(resourceInfo, {
                msg: ctx.gettext('params-validate-failed', 'resourceId'), data: { resourceId }
            });
            const { versionId } = this._getResourceVersionInfo(resourceInfo, version) || {};
            if (!versionId) {
                return ctx.success([]);
            }
            const versionInfo = await this.resourceVersionService.findOne({ versionId });
            await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
                isContainRootNode, maxDeep, omitFields
            }).then(ctx.success);
        }
        async authTree(ctx) {
            const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
            const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
            ctx.validateParams();
            const resourceInfo = await this.resourceService.findByResourceId(resourceId);
            ctx.entityNullObjectCheck(resourceInfo, {
                msg: ctx.gettext('params-validate-failed', 'resourceId'), data: { resourceId }
            });
            const { versionId } = this._getResourceVersionInfo(resourceInfo, version) || {};
            if (!versionId) {
                return ctx.success([]);
            }
            const versionInfo = await this.resourceVersionService.findOne({ versionId });
            await this.resourceService.getResourceAuthTree(resourceInfo, versionInfo).then(ctx.success);
        }
        async show(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
            ctx.validateParams();
            let resourceInfo = await this.resourceService.findByResourceId(resourceId);
            if (!resourceInfo) {
                return ctx.success(null);
            }
            resourceInfo = resourceInfo.toObject();
            if (isLoadLatestVersionInfo && resourceInfo.latestVersion) {
                const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, resourceInfo.latestVersion);
                resourceInfo.latestVersionInfo = await this.resourceVersionService.findOne({ versionId });
            }
            ctx.success(resourceInfo);
        }
        /**
         * 获取资源版本信息
         * @param resourceInfo
         * @param version
         * @returns {Object}
         * @private
         */
        _getResourceVersionInfo(resourceInfo, version) {
            if (version && !resourceInfo.resourceVersions.some(x => x.version === version)) {
                throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'version'));
            }
            if (!version) {
                version = resourceInfo.latestVersion;
            }
            return resourceInfo.resourceVersions.find(x => x.version === semver.clean(version));
        }
    };
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceController.prototype, "ctx", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceController.prototype, "resourcePropertyGenerator", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceController.prototype, "resourceService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceController.prototype, "resourcePolicyValidator", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceController.prototype, "resourceVersionService", void 0);
    __decorate([
        midway_1.get('/'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "index", null);
    __decorate([
        midway_1.post('/'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "create", null);
    __decorate([
        midway_1.get('/list'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "list", null);
    __decorate([
        midway_1.get('/detail'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "detail", null);
    __decorate([
        midway_1.put('/:resourceId'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "update", null);
    __decorate([
        midway_1.get('/:resourceId/dependencyTree'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "dependencyTree", null);
    __decorate([
        midway_1.get('/:resourceId/authTree'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "authTree", null);
    __decorate([
        midway_1.get('/:resourceId'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceController.prototype, "show", null);
    ResourceController = __decorate([
        midway_1.provide(),
        midway_1.controller('/v1/resources')
    ], ResourceController);
    return ResourceController;
})();
exports.ResourceController = ResourceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQW1FO0FBQ25FLHVEQUEwRTtBQUMxRSxrRkFBcUU7QUFFckUsbUNBQW1EO0FBQ25ELGlDQUFpQztBQUlqQztJQUFBLElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQWtCO1FBYzNCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRztZQUNYLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDOUUsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDL0YsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQzFHLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDekYsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3ZGLE1BQU0sVUFBVSxHQUFhLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUN0RyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDL0UsTUFBTSx1QkFBdUIsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzlHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixNQUFNLFNBQVMsR0FBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxNQUFNLEVBQUU7Z0JBQ1IsR0FBRyxDQUFDLHVCQUF1QixDQUFDLDRCQUFTLENBQUMsQ0FBQztnQkFDdkMsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUN6QztZQUNELElBQUksWUFBWSxFQUFFO2dCQUNkLFNBQVMsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO2FBQ3pDO1lBQ0QsSUFBSSxpQkFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzthQUM3QjtZQUNELElBQUksaUJBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLEVBQUUsRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQzthQUMvRTtZQUVELElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNsQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlELElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRTtnQkFDcEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQzthQUM3RDtZQUVELFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxFQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUMxQixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDckYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNoSSxZQUFZLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztnQkFDekMsT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxFQUFDLENBQUMsQ0FBQztnQkFDNUYsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzNCLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUN2RixJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7b0JBQzNDLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDLENBQUMsQ0FBQTthQUNMO1lBRUQsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFHSCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFFWixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNqRSxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNsRixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDbEYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzlGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ25HLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3JGLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkYsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO1lBRUQsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLGdCQUFPLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBVSxDQUFDLEVBQUU7b0JBQzlFLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxNQUFNO2lCQUN0QyxDQUFDLENBQUM7YUFDTjtZQUVELE1BQU0sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO1lBQzdELE1BQU0sS0FBSyxHQUFHO2dCQUNWLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxJQUFJO2FBQzNFLENBQUM7WUFFRixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsR0FBRyxRQUFRLElBQUksSUFBSSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN4RyxJQUFJLFlBQVksRUFBRTtvQkFDZCxNQUFNLElBQUksZ0NBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2lCQUN2RDtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFHRCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDVixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3pHLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RGLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM1RixHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFckIsSUFBSSxDQUFDLGdCQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFDLEVBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0RztpQkFBTSxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN6RztpQkFBTTtnQkFDSCxNQUFNLElBQUksZ0NBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQzthQUMzRTtRQUNMLENBQUM7UUFHRCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDWixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3RGLE1BQU0sdUJBQXVCLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM5RyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFckIsSUFBSSxZQUFZLEdBQVEsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2YsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsWUFBWSxHQUFHLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxJQUFJLHVCQUF1QixJQUFJLFlBQVksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDaEksWUFBWSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7YUFDM0Y7WUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFJRCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDWixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQztZQUN6RSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDdkYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDbEYsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUN2RixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3pFLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRTtnQkFDcEUsTUFBTSxJQUFJLGdDQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7YUFDM0U7WUFDRCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hILE1BQU0sSUFBSSxnQ0FBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQzthQUMxRjtZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztZQUMzRSxHQUFHLENBQUMsd0NBQXdDLENBQUMsWUFBWSxFQUFFLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsWUFBWSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1lBRXZILE1BQU0scUJBQXFCLEdBQUc7Z0JBQzFCLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLElBQUk7YUFDekQsQ0FBQztZQUVGLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFJRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUc7WUFFcEIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDakYsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUN6RixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDckksTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzVGLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDMUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXJCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RSxHQUFHLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFO2dCQUNwQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUM7YUFDL0UsQ0FBQyxDQUFDO1lBRUgsTUFBTSxFQUFDLFNBQVMsRUFBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzlFLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztZQUUzRSxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMseUJBQXlCLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRTtnQkFDNUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFVBQVU7YUFDekMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUlELEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRztZQUVkLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2pGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNySSxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFckIsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7Z0JBQ3BDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBQzthQUMvRSxDQUFDLENBQUM7WUFFSCxNQUFNLEVBQUMsU0FBUyxFQUFDLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDWixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDMUI7WUFDRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO1lBRTNFLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRyxDQUFDO1FBR0QsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ1YsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDekUsTUFBTSx1QkFBdUIsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzlHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVyQixJQUFJLFlBQVksR0FBUSxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDZixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUI7WUFDRCxZQUFZLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksdUJBQXVCLElBQUksWUFBWSxDQUFDLGFBQWEsRUFBRTtnQkFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25ILFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO2FBQzNGO1lBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsdUJBQXVCLENBQUMsWUFBWSxFQUFFLE9BQU87WUFDekMsSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsRUFBRTtnQkFDNUUsTUFBTSxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUNsRjtZQUNELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsT0FBTyxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUM7YUFDeEM7WUFDRCxPQUFPLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDO0tBQ0osQ0FBQTtJQTlQRztRQURDLGVBQU0sRUFBRTs7bURBQ0w7SUFFSjtRQURDLGVBQU0sRUFBRTs7eUVBQ2lCO0lBRTFCO1FBREMsZUFBTSxFQUFFOzsrREFDeUI7SUFFbEM7UUFEQyxlQUFNLEVBQUU7O3VFQUNvQztJQUU3QztRQURDLGVBQU0sRUFBRTs7c0VBQ3VDO0lBR2hEO1FBREMsWUFBRyxDQUFDLEdBQUcsQ0FBQzs7OzttREF1RFI7SUFVRDtRQUZDLGFBQUksQ0FBQyxHQUFHLENBQUM7UUFDVCx5Q0FBZSxDQUFDLDRCQUFTLENBQUM7Ozs7b0RBa0MxQjtJQUdEO1FBREMsWUFBRyxDQUFDLE9BQU8sQ0FBQzs7OztrREFjWjtJQUdEO1FBREMsWUFBRyxDQUFDLFNBQVMsQ0FBQzs7OztvREFnQmQ7SUFJRDtRQUZDLFlBQUcsQ0FBQyxjQUFjLENBQUM7UUFDbkIseUNBQWUsQ0FBQyw0QkFBUyxDQUFDOzs7O29EQXdCMUI7SUFJRDtRQUZDLFlBQUcsQ0FBQyw2QkFBNkIsQ0FBQztRQUNsQyx5Q0FBZSxDQUFDLDRCQUFTLEdBQUcsaUNBQWMsQ0FBQzs7Ozs0REF3QjNDO0lBSUQ7UUFGQyxZQUFHLENBQUMsdUJBQXVCLENBQUM7UUFDNUIseUNBQWUsQ0FBQyw0QkFBUyxHQUFHLGlDQUFjLENBQUM7Ozs7c0RBbUIzQztJQUdEO1FBREMsWUFBRyxDQUFDLGNBQWMsQ0FBQzs7OztrREFnQm5CO0lBL09RLGtCQUFrQjtRQUY5QixnQkFBTyxFQUFFO1FBQ1QsbUJBQVUsQ0FBQyxlQUFlLENBQUM7T0FDZixrQkFBa0IsQ0FpUTlCO0lBQUQseUJBQUM7S0FBQTtBQWpRWSxnREFBa0IifQ==