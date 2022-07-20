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
const resource_property_generator_1 = require("../../extend/resource-property-generator");
let ResourceController = class ResourceController {
    ctx;
    resourceService;
    resourcePolicyValidator;
    resourceVersionService;
    elasticSearchService;
    resourceTypeRepairService;
    resourcePropertyGenerator;
    async resourceTypeRepair() {
        await this.resourceTypeRepairService.resourceTypeRepair().then(() => this.ctx.success(true));
    }
    async resourceMetaRepair() {
        await this.resourceTypeRepairService.resourceMetaRepair().then(() => this.ctx.success(true));
    }
    async resourceExpiredContractClear() {
        await this.resourceTypeRepairService.resourceExpiredContractClear().then(() => this.ctx.success(true));
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
        const isLoadFreezeReason = ctx.checkQuery('isLoadFreezeReason').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();
        const condition = {};
        if (userId) {
            condition.userId = userId;
        }
        else if (isSelf) {
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
        if (isLoadFreezeReason) {
            pageResult.dataList = await this.resourceService.fillResourceFreezeReason(pageResult.dataList);
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
        const userId = ctx.checkQuery('userId').ignoreParamWhenEmpty().isUserId().toInt().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const isLoadFreezeReason = ctx.checkQuery('isLoadFreezeReason').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();
        const queryUserId = userId ? userId : isSelf ? ctx.userId : undefined;
        const pageResult = await this.elasticSearchService.search(skip, limit, sort, keywords, queryUserId, resourceType, omitResourceType, status, tags, projection, startCreateDate, endCreateDate);
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        if (isLoadFreezeReason) {
            pageResult.dataList = await this.resourceService.fillResourceFreezeReason(pageResult.dataList);
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
        const status = ctx.checkQuery('status').ignoreParamWhenEmpty().isSplitNumber().toSplitArray().len(0, 10).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        const isLoadFreezeReason = ctx.checkQuery('isLoadFreezeReason').optional().toInt().in([0, 1]).value;
        ctx.validateParams();
        const condition = {};
        if (status) {
            condition.status = { $in: status };
        }
        if (!(0, lodash_1.isEmpty)(resourceIds)) {
            condition['_id'] = { $in: resourceIds };
        }
        if (!(0, lodash_1.isEmpty)(resourceNames)) {
            condition.uniqueKey = { $in: resourceNames.map(x => this.resourcePropertyGenerator.generateResourceUniqueKey(x)) };
        }
        if ((0, lodash_1.isEmpty)(resourceIds) && (0, lodash_1.isEmpty)(resourceNames)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        let dataList = await this.resourceService.find(condition, projection.join(' '));
        if (isLoadPolicyInfo) {
            dataList = await this.resourceService.fillResourcePolicyInfo(dataList, isTranslate);
        }
        if (isLoadLatestVersionInfo) {
            dataList = await this.resourceService.fillResourceLatestVersionInfo(dataList);
        }
        if (isLoadFreezeReason) {
            dataList = await this.resourceService.fillResourceFreezeReason(dataList);
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
        const status = ctx.checkBody('status').optional().toInt().in([0, 1]).value;
        ctx.validateParams();
        if ([updatePolicies, addPolicies, intro, coverImages, tags, status].every(lodash_1.isUndefined)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!(0, lodash_1.isEmpty)(coverImages) && coverImages.some(x => !(0, validator_1.isURL)(x.toString(), { protocols: ['https'] }))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }
        this._policySchemaValidate(addPolicies, 'addPolicy');
        this._policySchemaValidate(updatePolicies, 'updatePolicy');
        const resourceInfo = await this.resourceService.findOne({ _id: resourceId });
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        if (status === 1 && !resourceInfo.resourceVersions.length) {
            throw new egg_freelog_base_1.ApplicationError('资源上架时,最少需要一个创建一个版本');
        }
        const updateResourceOptions = {
            resourceId, intro, coverImages, tags, addPolicies, updatePolicies, status
        };
        await this.resourceService.updateResource(resourceInfo, updateResourceOptions).then(ctx.success);
    }
    // 通过修改资源信息接口实现
    // @put('/:resourceId/status')
    // @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    // async updateOnlineStatus() {
    //     const {ctx} = this;
    //     const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
    //     // 0:下架 1:上架 2:冻结(下架) 3:冻结(上架)
    //     const status = ctx.checkBody('status').exist().toInt().in([0, 1]).value;
    //     // 启用的授权策略
    //     const enablePolicyIds = ctx.checkBody('enablePolicyIds').optional().isArray().len(0, 100).value;
    //     // 禁用的授权策略
    //     const disablePolicyIds = ctx.checkBody('disablePolicyIds').optional().isArray().len(0, 100).value;
    //     ctx.validateParams();
    //
    //     const resourceInfo = await this.resourceService.findOne({_id: resourceId});
    //     ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});
    //     if ((resourceInfo.status & 2) == 2) {
    //         throw new ApplicationError('资源已被冻结,无法执行上下架操作');
    //     }
    //     if (enablePolicyIds || disablePolicyIds) {
    //         for (let policy of resourceInfo.policies) {
    //             if (enablePolicyIds?.includes(policy.policyId)) {
    //                 policy.status = 1;
    //             }
    //             if (disablePolicyIds?.includes(policy.policyId)) {
    //                 policy.status = 0;
    //             }
    //         }
    //     }
    //     if (status === 1 && !resourceInfo.policies.some(x => x.status === 1)) {
    //         throw new ApplicationError('资源上架时,最少需要一个启用的授权策略');
    //     }
    //     if (status === 1 && !resourceInfo.resourceVersions.length) {
    //         throw new ApplicationError('资源上架时,最少需要一个创建一个版本');
    //     }
    //     resourceInfo.status = status;
    //     const modify = pick(resourceInfo, ['status', 'policies']);
    //     await this.resourceService.resourceProvider.updateOne({_id: resourceInfo.resourceId}, modify).then(x => ctx.success(true));
    // }
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
        const isLoadFreezeReason = ctx.checkQuery('isLoadFreezeReason').optional().toInt().in([0, 1]).value;
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
        if (resourceInfo && isLoadFreezeReason) {
            resourceInfo = await this.resourceService.fillResourceFreezeReason([resourceInfo]).then(lodash_1.first);
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
    (0, midway_1.inject)(),
    __metadata("design:type", resource_property_generator_1.ResourcePropertyGenerator)
], ResourceController.prototype, "resourcePropertyGenerator", void 0);
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
    (0, midway_1.get)('/resourceExpiredContractClear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "resourceExpiredContractClear", null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHlDQUFnQztBQUNoQyxtQ0FBbUU7QUFFbkUsbUNBQTZGO0FBQzdGLHVEQU8wQjtBQUMxQiw4RUFBdUU7QUFDdkUsMEZBQWtGO0FBQ2xGLDBGQUFtRjtBQUluRixJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtJQUczQixHQUFHLENBQWlCO0lBRXBCLGVBQWUsQ0FBbUI7SUFFbEMsdUJBQXVCLENBQXNCO0lBRTdDLHNCQUFzQixDQUEwQjtJQUVoRCxvQkFBb0IsQ0FBdUI7SUFFM0MseUJBQXlCLENBQTRCO0lBRXJELHlCQUF5QixDQUE0QjtJQUdyRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUdELEtBQUssQ0FBQyxrQkFBa0I7UUFDcEIsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBR0QsS0FBSyxDQUFDLDRCQUE0QjtRQUM5QixNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFHRCxLQUFLLENBQUMsa0JB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