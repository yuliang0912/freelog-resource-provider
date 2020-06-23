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
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
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
                condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
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
            if (!isLoadLatestVersionInfo || !lodash_1.isEmpty(projection) && (!projection.includes('resourceId') || !projection.includes('latestVersion'))) {
                return ctx.success({ page, pageSize, totalItem, dataList });
            }
            const versionIds = dataList.filter(x => !lodash_1.isEmpty(x.latestVersion)).map(resourceInfo => {
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
            const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
            const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value;
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
        async update(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            const policyChangeInfo = ctx.checkBody('policyChangeInfo').optional().isObject().value;
            const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
            const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
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
            const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
            const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            ctx.validateParams();
            let resourceInfo = null;
            if (common_regex_1.mongoObjectId.test(resourceIdOrName)) {
                resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '));
            }
            else if (common_regex_1.fullReleaseName.test(resourceIdOrName)) {
                resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '));
            }
            else {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
            }
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
        midway_1.get('/:resourceIdOrName'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQW1FO0FBQ25FLHVEQUEwRTtBQUMxRSxrRkFBcUU7QUFFckUsbUNBQW1EO0FBQ25ELGlDQUFpQztBQUNqQyxrRkFBK0Y7QUFJL0Y7SUFBQSxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtRQWMzQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDWCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQzlFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQy9GLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUMxRyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3pGLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxD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