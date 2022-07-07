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
const validator_1 = require("validator");
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const elastic_search_service_1 = require("../service/elastic-search-service");
const resource_type_repair_service_1 = require("../service/resource-type-repair-service");
let ResourceController = class ResourceController {
    ctx;
    resourceService;
    resourcePolicyValidator;
    resourceVersionService;
    elasticSearchService;
    resourceTypeRepairService;
    async resourceTypeRepair() {
        await this.resourceTypeRepairService.resourceTypeRepair().then(() => this.ctx.success(true));
    }
    async resourceMetaRepair() {
        await this.resourceTypeRepairService.resourceMetaRepair().then(() => this.ctx.success(true));
    }
    async recommendResources() {
        const { ctx } = this;
        // 推荐类型 1:推荐主题资源 2:占位资源
        const recommendType = ctx.checkQuery('recommendType').exist().toInt().in([1, 2]).value;
        ctx.validateParams();
        const dataMap = new Map();
        dataMap.set('test_1', ['60ef9c4ea11650002e840fcd', '611372050938740039ad6df2', '61400afcf27e48003f5e230c', '617654aae886b0003419469d', '61d6b5652ae3ac002eb85783']);
        dataMap.set('test_2', ['62b01142d2bca6002e366f20']);
        const resourceIds = dataMap.get(`${ctx.app.env}_${recommendType}`) ?? [];
        if ((0, lodash_1.isEmpty)(resourceIds)) {
            return ctx.success([]);
        }
        await this.resourceService.find({ _id: { $in: resourceIds } }).then(ctx.success);
    }
    /**
     * DB搜索资源列表
     */
    async dbSearch() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const userId = ctx.checkQuery('userId').ignoreParamWhenEmpty().isUserId().toInt().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();
        const condition = {};
        if (userId) {
            condition.userId = ctx.userId;
        }
        if (isSelf) {
            ctx.validateVisitorIdentity(egg_freelog_base_1.IdentityTypeEnum.LoginUser);
            condition.userId = ctx.userId;
        }
        if ((0, lodash_1.isString)(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        }
        else if ((0, lodash_1.isString)(omitResourceType)) {
            condition.resourceType = { $ne: omitResourceType };
        }
        if ((0, lodash_1.includes)([0, 1], status)) {
            condition.status = status;
        }
        if ((0, lodash_1.isString)(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{ resourceName: searchRegExp }, { resourceType: searchRegExp }];
        }
        if ((0, lodash_1.isDate)(startCreateDate) && (0, lodash_1.isDate)(endCreateDate)) {
            condition.createDate = { $gte: startCreateDate, $lte: endCreateDate };
        }
        else if ((0, lodash_1.isDate)(startCreateDate)) {
            condition.createDate = { $gte: startCreateDate };
        }
        else if ((0, lodash_1.isDate)(endCreateDate)) {
            condition.createDate = { $lte: endCreateDate };
        }
        if (!(0, lodash_1.isEmpty)(tags)) {
            condition.tags = { $in: tags };
        }
        const pageResult = await this.resourceService.findIntervalList(condition, skip, limit, projection, sort ?? { updateDate: -1 });
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }
    /**
     * ES搜索资源列表
     */
    async esSearch() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').ignoreParamWhenEmpty().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();
        const pageResult = await this.elasticSearchService.search(skip, limit, sort, keywords, isSelf ? ctx.userId : undefined, resourceType, omitResourceType, status, tags, projection, startCreateDate, endCreateDate);
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }
    /**
     * DB搜索资源列表
     */
    async searchForAdmin() {
        const { ctx } = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const userId = ctx.checkQuery('userId').ignoreParamWhenEmpty().isUserId().toInt().value;
        const resourceId = ctx.checkQuery('resourceId').ignoreParamWhenEmpty().isResourceId().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();
        const condition = {};
        if (userId) {
            condition.userId = userId;
        }
        if (isSelf) {
            ctx.validateVisitorIdentity(egg_freelog_base_1.IdentityTypeEnum.LoginUser);
            condition.userId = ctx.userId;
        }
        if ((0, lodash_1.isString)(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        }
        else if ((0, lodash_1.isString)(omitResourceType)) {
            condition.resourceType = { $ne: omitResourceType };
        }
        if ((0, lodash_1.includes)([0, 1], status)) {
            condition.status = status;
        }
        if ((0, lodash_1.isString)(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{ resourceName: searchRegExp }, { resourceType: searchRegExp }];
        }
        if ((0, lodash_1.isDate)(startCreateDate) && (0, lodash_1.isDate)(endCreateDate)) {
            condition.createDate = { $gte: startCreateDate, $lte: endCreateDate };
        }
        else if ((0, lodash_1.isDate)(startCreateDate)) {
            condition.createDate = { $gte: startCreateDate };
        }
        else if ((0, lodash_1.isDate)(endCreateDate)) {
            condition.createDate = { $lte: endCreateDate };
        }
        if (!(0, lodash_1.isEmpty)(tags)) {
            condition.tags = { $in: tags };
        }
        if (resourceId) {
            condition._id = resourceId;
        }
        const pageResult = await this.resourceService.findIntervalList(condition, skip, limit, projection, sort ?? { updateDate: -1 });
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }
    /**
     * 搜索关键字补全
     */
    async keywordSuggest() {
        const { ctx } = this;
        const prefix = ctx.checkQuery('prefix').exist().len(1, 70).value;
        ctx.validateParams();
        await this.elasticSearchService.suggest(prefix).then(ctx.success);
    }
    async create(ctx) {
        const name = ctx.checkBody('name').exist().isResourceName().trim().value;
        const resourceType = ctx.checkBody('resourceType').exist().isArray().len(1, 5).value;
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        const intro = ctx.checkBody('intro').optional().default('').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value; // 单个标签长度也限制为20,未实现
        ctx.validateParams();
        if (coverImages.some(x => !(0, validator_1.isURL)(x.toString(), { protocols: ['https'] }))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }
        // if (resourceType.some(x => !CommonRegex.resourceType.test(x))) {
        //     throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceType'));
        // }
        this._policySchemaValidate(policies, 'addPolicy');
        const { userId, username } = ctx.identityInfo.userInfo;
        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(data => {
            if ((0, lodash_1.isString)(data?.resourceName)) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('name is already existing'));
            }
        });
        const model = {
            userId, username, resourceType, name, intro, coverImages, policies, tags
        };
        await this.resourceService.createResource(model).then(ctx.success);
    }
    async createdCount() {
        const { ctx } = this;
        const userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
        const status = ctx.checkQuery('status').optional().toInt().value;
        ctx.validateParams();
        const list = await this.resourceService.findUserCreatedResourceCounts(userIds.map(x => parseInt(x)), status);
        ctx.success(userIds.map(userId => {
            const record = list.find(x => x.userId.toString() === userId);
            return { userId: parseInt(userId), createdResourceCount: record?.count ?? 0 };
        }));
    }
    async list() {
        const { ctx } = this;
        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().decodeURIComponent().toSplitArray().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();
        let dataList = [];
        if (!(0, lodash_1.isEmpty)(resourceIds)) {
            dataList = await this.resourceService.find({ _id: { $in: resourceIds } }, projection.join(' '));
        }
        else if (!(0, lodash_1.isEmpty)(resourceNames)) {
            dataList = await this.resourceService.findByResourceNames(resourceNames, projection.join(' '));
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (isLoadPolicyInfo) {
            dataList = await this.resourceService.fillResourcePolicyInfo(dataList, isTranslate);
        }
        if (isLoadLatestVersionInfo) {
            dataList = await this.resourceService.fillResourceLatestVersionInfo(dataList);
        }
        ctx.success(dataList);
    }
    async update() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const updatePolicies = ctx.checkBody('updatePolicies').optional().isArray().value;
        const addPolicies = ctx.checkBody('addPolicies').optional().isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).value;
        ctx.validateParams();
        if ([updatePolicies, addPolicies, intro, coverImages, tags].every(lodash_1.isUndefined)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!(0, lodash_1.isEmpty)(coverImages) && coverImages.some(x => !(0, validator_1.isURL)(x.toString(), { protocols: ['https'] }))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }
        this._policySchemaValidate(addPolicies, 'addPolicy');
        this._policySchemaValidate(updatePolicies, 'updatePolicy');
        const resourceInfo = await this.resourceService.findOne({ _id: resourceId });
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        const updateResourceOptions = {
            resourceId, intro, coverImages, tags, addPolicies, updatePolicies
        };
        await this.resourceService.updateResource(resourceInfo, updateResourceOptions).then(ctx.success);
    }
    // 批量设置或移除资源标签
    async batchSetOrRemoveResourceTag() {
        const { ctx } = this;
        const resourceIds = ctx.checkBody('resourceIds').exist().isArray().len(1, 100).value;
        const tagNames = ctx.checkBody('tagNames').exist().isArray().len(1, 100).value;
        const setType = ctx.checkBody('setType').exist().toInt().in([1, 2]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        await this.resourceService.batchSetOrUnsetResourceTag(resourceIds, tagNames, setType).then(ctx.success);
    }
    // @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async dependencyTree() {
        const { ctx } = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        let resourceInfo = null;
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        }
        else if (egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: { resourceIdOrName }
        });
        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if ((0, lodash_1.isString)(version)) {
            resourceVersion = version;
        }
        else if ((0, lodash_1.isString)(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }
        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: { version }
        });
        await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
            isContainRootNode, maxDeep, omitFields
        }).then(ctx.success);
    }
    // @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async authTree() {
        const { ctx } = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        // const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        let resourceInfo = null;
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        }
        else if (egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: { resourceIdOrName }
        });
        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if ((0, lodash_1.isString)(version)) {
            resourceVersion = version;
        }
        else if ((0, lodash_1.isString)(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }
        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: { version }
        });
        await this.resourceService.getResourceAuthTree(versionInfo).then(ctx.success);
    }
    // @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async relationTree() {
        const { ctx } = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        let resourceInfo = null;
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        }
        else if (egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: { resourceIdOrName }
        });
        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if ((0, lodash_1.isString)(version)) {
            resourceVersion = version;
        }
        else if ((0, lodash_1.isString)(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }
        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: { version }
        });
        await this.resourceService.getRelationTree(versionInfo).then(ctx.success);
    }
    async show() {
        const { ctx } = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();
        let resourceInfo = null;
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '));
        }
        else if (egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '));
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        if (resourceInfo && isLoadLatestVersionInfo) {
            resourceInfo = await this.resourceService.fillResourceLatestVersionInfo([resourceInfo]).then(lodash_1.first);
        }
        if (resourceInfo && isLoadPolicyInfo) {
            resourceInfo = await this.resourceService.fillResourcePolicyInfo([resourceInfo], isTranslate).then(lodash_1.first);
        }
        ctx.success(resourceInfo);
    }
    async contractCoverageVersions() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractId = ctx.checkParams('contractId').exist().isContractId().value;
        ctx.validateParams();
        const condition = { resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': contractId };
        await this.resourceVersionService.find(condition, 'version versionId').then(ctx.success);
    }
    async contractsCoverageVersions() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();
        const condition = { resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': { $in: contractIds } };
        const contractMap = new Map(contractIds.map(x => [x, []]));
        const dataList = await this.resourceVersionService.find(condition, 'version versionId resolveResources.contracts.contractId');
        for (const resourceVersion of dataList) {
            for (const resolveResource of resourceVersion.resolveResources) {
                for (const contract of resolveResource.contracts) {
                    const list = contractMap.get(contract.contractId);
                    list?.push((0, lodash_1.pick)(resourceVersion, ['version', 'versionId']));
                }
            }
        }
        const result = [];
        for (let [key, value] of contractMap) {
            result.push({ contractId: key, versions: (0, lodash_1.uniqBy)(value, 'versionId') });
        }
        ctx.success(result);
    }
    // 同一个资源下所有版本解决的子依赖(含上抛)列表以及对应的解决方式
    async allResolveResources() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        const resolveResourceMap = new Map();
        const allResourceVersions = await this.resourceVersionService.find({ resourceId }, 'version versionId resolveResources');
        for (const resourceVersion of allResourceVersions) {
            for (const resourceResource of resourceVersion.resolveResources) {
                const { resourceId, resourceName, contracts } = resourceResource;
                if (!resolveResourceMap.has(resourceId)) {
                    resolveResourceMap.set(resourceId, { resourceId, resourceName, versions: [] });
                }
                resolveResourceMap.get(resourceId).versions.push({
                    version: resourceVersion.version, versionId: resourceVersion.versionId, contracts
                });
            }
        }
        ctx.success([...resolveResourceMap.values()]);
    }
    /**
     * 根据sha1查询资料列表
     */
    async resourceBySha1() {
        const { ctx } = this;
        const fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        const resourceVersions = await this.resourceVersionService.find({ fileSha1 }, 'resourceId versionId');
        const resourceIds = resourceVersions.map(t => t.resourceId);
        if (!resourceIds.length) {
            return ctx.success([]);
        }
        const resourceVersionIdSet = new Set(resourceVersions.map(x => x.versionId));
        const resources = await this.resourceService.find({ _id: { $in: resourceIds } }, projection);
        for (const resourceInfo of resources) {
            if (resourceInfo.resourceVersions) {
                resourceInfo.resourceVersions = resourceInfo.resourceVersions.filter(x => resourceVersionIdSet.has(x.versionId));
            }
        }
        ctx.success(resources);
    }
    /**
     * 批量冻结或解冻资源
     */
    async batchFreeOrRecoverResource() {
        const { ctx } = this;
        const resourceIds = ctx.checkBody('resourceIds').exist().isArray().len(1, 100).value;
        const reason = ctx.checkBody('reason').optional().len(1, 200).value;
        const remark = ctx.checkBody('remark').optional().len(1, 200).value;
        const operationType = ctx.checkBody('operationType').exist().toInt().in([1, 2]).value;
        ctx.validateParams().validateOfficialAuditAccount();
        await this.resourceService.batchFreeOrRecoverResource(resourceIds, operationType, reason, remark).then(ctx.success);
    }
    /**
     * 资源冻结或解冻记录
     */
    async freeOrRecoverRecords() {
        const { ctx } = this;
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 100).value;
        const recordDesc = ctx.checkQuery('remark').optional().default(1).toInt().in([0, 1]).value;
        const recordLimit = ctx.checkQuery('recordLimit').ignoreParamWhenEmpty().toInt().default(10).gt(0).le(100).value;
        ctx.validateParams().validateOfficialAuditAccount();
        const dataList = await this.resourceService.batchFindFreeOrRecoverRecords(resourceIds, undefined, recordLimit * (recordDesc ? -1 : 1));
        if (recordDesc) {
            dataList.forEach(x => x.records.reverse());
        }
        ctx.success(dataList);
    }
    /**
     * 策略格式校验
     * @param policies
     * @param mode
     */
    _policySchemaValidate(policies, mode) {
        const policyValidateResult = this.resourcePolicyValidator.validate(policies || [], mode);
        if (!(0, lodash_1.isEmpty)(policyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: policyValidateResult.errors
            });
        }
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceController.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceController.prototype, "resourcePolicyValidator", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceController.prototype, "resourceVersionService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", elastic_search_service_1.ElasticSearchService)
], ResourceController.prototype, "elasticSearchService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", resource_type_repair_service_1.ResourceTypeRepairService)
], ResourceController.prototype, "resourceTypeRepairService", void 0);
__decorate([
    (0, midway_1.get)('/resourceTypeRepair'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "resourceTypeRepair", null);
__decorate([
    (0, midway_1.get)('/resourceMetaRepair'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "resourceMetaRepair", null);
__decorate([
    (0, midway_1.get)('/recommend'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "recommendResources", null);
__decorate([
    (0, midway_1.get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "dbSearch", null);
__decorate([
    (0, midway_1.get)('/esSearch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "esSearch", null);
__decorate([
    (0, midway_1.get)('/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "searchForAdmin", null);
__decorate([
    (0, midway_1.get)('/keywordSuggest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "keywordSuggest", null);
__decorate([
    (0, midway_1.post)('/'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "create", null);
__decorate([
    (0, midway_1.get)('/count'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "createdCount", null);
__decorate([
    (0, midway_1.get)('/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "list", null);
__decorate([
    (0, midway_1.put)('/:resourceId'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "update", null);
__decorate([
    (0, midway_1.put)('/tags/batchSetOrRemoveResourceTag'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "batchSetOrRemoveResourceTag", null);
__decorate([
    (0, midway_1.get)('/:resourceIdOrName/dependencyTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "dependencyTree", null);
__decorate([
    (0, midway_1.get)('/:resourceIdOrName/authTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "authTree", null);
__decorate([
    (0, midway_1.get)('/:resourceIdOrName/relationTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "relationTree", null);
__decorate([
    (0, midway_1.get)('/:resourceIdOrName'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "show", null);
__decorate([
    (0, midway_1.get)('/:resourceId/contracts/:contractId/coverageVersions'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "contractCoverageVersions", null);
__decorate([
    (0, midway_1.get)('/:resourceId/contracts/coverageVersions'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "contractsCoverageVersions", null);
__decorate([
    (0, midway_1.get)('/:resourceId/resolveResources'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "allResolveResources", null);
__decorate([
    (0, midway_1.get)('/files/:fileSha1'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "resourceBySha1", null);
__decorate([
    (0, midway_1.put)('/freeOrRecover/batch'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "batchFreeOrRecoverResource", null);
__decorate([
    (0, midway_1.get)('/freeOrRecover/records'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "freeOrRecoverRecords", null);
ResourceController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/resources')
], ResourceController);
exports.ResourceController = ResourceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHlDQUFnQztBQUNoQyxtQ0FBbUU7QUFFbkUsbUNBQTZGO0FBQzdGLHVEQU8wQjtBQUMxQiw4RUFBdUU7QUFDdkUsMEZBQWtGO0FBSWxGLElBQWEsa0JBQWtCLEdBQS9CLE1BQWEsa0JBQWtCO0lBRzNCLEdBQUcsQ0FBaUI7SUFFcEIsZUFBZSxDQUFtQjtJQUVsQyx1QkFBdUIsQ0FBc0I7SUFFN0Msc0JBQXNCLENBQTBCO0lBRWhELG9CQUFvQixDQUF1QjtJQUUzQyx5QkFBeUIsQ0FBNEI7SUFHckQsS0FBSyxDQUFDLGtCQUFrQjtRQUNwQixNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFHRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUdELEtBQUssQ0FBQyxrQkFBa0I7UUFDcEIsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQix1QkFBdUI7UUFDdkIsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxL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