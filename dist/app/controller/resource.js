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
const semver = require("semver");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const lodash_1 = require("lodash");
const common_regex_1 = require("egg-freelog-base/app/extend/helper/common_regex");
let ResourceController = class ResourceController {
    async index(ctx) {
        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const startResourceId = ctx.checkQuery('startResourceId').optional().isResourceId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        ctx.validateParams();
        const condition = {};
        if (isSelf) {
            ctx.validateVisitorIdentity(egg_freelog_base_1.LoginUser);
            condition.userId = ctx.userId;
        }
        if (resourceType) {
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        }
        if (lodash_1.includes([0, 1], status)) {
            condition.status = status;
        }
        if (lodash_1.isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{ resourceName: searchRegExp }, { resourceType: searchRegExp }];
        }
        if (!lodash_1.isUndefined(startResourceId)) {
            condition._id = { $lt: startResourceId };
        }
        const pageResult = await this.resourceService.findPageList(condition, page, pageSize, projection, { createDate: -1 });
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        return ctx.success(pageResult);
    }
    async create(ctx) {
        const name = ctx.checkBody('name').exist().isResourceName().value;
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').default('').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value;
        ctx.validateParams();
        if (coverImages.some(x => !ctx.app.validator.isURL(x.toString(), { protocols: ['https'] }))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }
        this._policySchemaValidate(policies);
        const { userId, username } = ctx.userInfo;
        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(resourceName => {
            if (resourceName) {
                throw new egg_freelog_base_1.ArgumentError('name is already existing');
            }
        });
        const model = {
            userId, username, resourceType, name, intro, coverImages, policies, tags
        };
        await this.resourceService.createResource(model).then(ctx.success);
    }
    async list(ctx) {
        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().decodeURIComponent().toSplitArray().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        let dataList = [];
        if (!lodash_1.isEmpty(resourceIds)) {
            dataList = await this.resourceService.find({ _id: { $in: resourceIds } }, projection.join(' '));
        }
        else if (!lodash_1.isEmpty(resourceNames)) {
            dataList = await this.resourceService.findByResourceNames(resourceNames, projection.join(' '));
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (isLoadPolicyInfo) {
            dataList = await this.resourceService.fillResourcePolicyInfo(dataList);
        }
        if (isLoadLatestVersionInfo) {
            dataList = await this.resourceService.fillResourceLatestVersionInfo(dataList);
        }
        ctx.success(dataList);
    }
    async update(ctx) {
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const updatePolicies = ctx.checkBody('updatePolicies').optional().isArray().value;
        const addPolicies = ctx.checkBody('addPolicies').optional().isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(1, 20).value;
        ctx.validateParams();
        if ([updatePolicies, addPolicies, intro, coverImages, tags].every(lodash_1.isUndefined)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!lodash_1.isEmpty(coverImages) && coverImages.some(x => !ctx.app.validator.isURL(x.toString(), { protocols: ['https'] }))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'));
        }
        this._policySchemaValidate(addPolicies);
        this._policySchemaValidate(updatePolicies);
        const resourceInfo = await this.resourceService.findOne({ _id: resourceId });
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        const updateResourceOptions = {
            resourceId, intro, coverImages, tags, addPolicies, updatePolicies
        };
        await this.resourceService.updateResource(resourceInfo, updateResourceOptions).then(ctx.success);
    }
    async dependencyTree(ctx) {
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        let resourceInfo = null;
        if (common_regex_1.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        }
        else if (common_regex_1.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'), data: { resourceIdOrName }
        });
        if (lodash_1.isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if (lodash_1.isString(version)) {
            resourceVersion = version;
        }
        else if (lodash_1.isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }
        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: { version }
        });
        await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
            isContainRootNode, maxDeep, omitFields
        }).then(ctx.success);
    }
    async show(ctx) {
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        let resourceInfo = null;
        if (common_regex_1.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '));
        }
        else if (common_regex_1.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '));
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        if (resourceInfo && isLoadLatestVersionInfo) {
            resourceInfo = await this.resourceService.fillResourceLatestVersionInfo([resourceInfo]).then(lodash_1.first);
        }
        if (resourceInfo && isLoadPolicyInfo) {
            resourceInfo = await this.resourceService.fillResourcePolicyInfo([resourceInfo]).then(lodash_1.first);
        }
        ctx.success(resourceInfo);
    }
    async contractCoverageVersions(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractId = ctx.checkParams('contractId').exist().isContractId().value;
        ctx.validateParams();
        const condition = { resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': contractId };
        await this.resourceVersionService.find(condition, 'version versionId').then(ctx.success);
    }
    async contractsCoverageVersions(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();
        const condition = { resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': { $in: contractIds } };
        const contractMap = new Map(contractIds.map(x => [x, []]));
        const dataList = await this.resourceVersionService.find(condition, 'version versionId resolveResources.contracts.contractId');
        dataList.forEach(resourceVersion => resourceVersion.resolveResources.forEach(resolveResource => resolveResource.contracts.forEach(contract => {
            const list = contractMap.get(contract.contractId);
            if (list) {
                list.push(lodash_1.pick(resourceVersion, ['version', 'versionId']));
            }
        })));
        const result = [];
        for (let [key, value] of contractMap) {
            result.push({ contractId: key, versions: lodash_1.uniqBy(value, 'versionId') });
        }
        ctx.success(result);
    }
    // 同一个资源下所有版本解决的子依赖(含上抛)列表以及对应的解决方式
    async allResolveResources(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        const resolveResourceMap = new Map();
        const allResourceVersions = await this.resourceVersionService.find({ resourceId }, 'version versionId resolveResources');
        allResourceVersions.forEach(resourceVersion => resourceVersion.resolveResources.forEach((resourceResource, index) => {
            const { resourceId, resourceName, contracts } = resourceResource;
            if (!resolveResourceMap.has(resourceId)) {
                resolveResourceMap.set(resourceId, { resourceId, resourceName, versions: [] });
            }
            resolveResourceMap.get(resourceId).versions.push({
                version: resourceVersion.version, versionId: resourceVersion.versionId, contracts
            });
        }));
        ctx.success([...resolveResourceMap.values()]);
    }
    /**
     * 策略格式校验
     * @param policies
     * @private
     */
    _policySchemaValidate(policies) {
        const policyValidateResult = this.resourcePolicyValidator.validate(policies || []);
        if (!lodash_1.isEmpty(policyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: policyValidateResult.errors
            });
        }
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceController.prototype, "ctx", void 0);
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
    midway_1.get('/:resourceIdOrName/dependencyTree'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "dependencyTree", null);
__decorate([
    midway_1.get('/:resourceIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "show", null);
__decorate([
    midway_1.get('/:resourceId/contracts/:contractId/coverageVersions'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "contractCoverageVersions", null);
__decorate([
    midway_1.get('/:resourceId/contracts/coverageVersions'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "contractsCoverageVersions", null);
__decorate([
    midway_1.get('/:resourceId/resolveResources'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "allResolveResources", null);
ResourceController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/resources')
], ResourceController);
exports.ResourceController = ResourceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLG1DQUFtRTtBQUNuRSx1REFBMEU7QUFDMUUsa0ZBQXFFO0FBRXJFLG1DQUFxRjtBQUNyRixrRkFBZ0c7QUFJaEcsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFZM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ1gsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUM5RSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMvRixNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDMUcsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUN6RixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxD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