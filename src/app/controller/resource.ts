import * as semver from 'semver';
import {isURL} from 'validator';
import {controller, get, inject, post, provide, put} from 'midway';
import {IResourceService, IResourceVersionService} from '../../interface';
import {first, includes, isEmpty, isString, isUndefined, pick, uniqBy, isDate} from 'lodash';
import {
    ArgumentError, IdentityTypeEnum, visitorIdentityValidator, CommonRegex, FreelogContext, IJsonSchemaValidate
} from 'egg-freelog-base';
import {ElasticSearchService} from '../service/elastic-search-service';

@provide()
@controller('/v2/resources')
export class ResourceController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;
    @inject()
    resourcePolicyValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionService: IResourceVersionService;
    @inject()
    elasticSearchService: ElasticSearchService;

    /**
     * DB搜索资源列表
     */
    @get('/')
    async dbSearch() {

        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();

        const condition: any = {};
        if (isSelf) {
            ctx.validateVisitorIdentity(IdentityTypeEnum.LoginUser);
            condition.userId = ctx.userId;
        }
        if (isString(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        } else if (isString(omitResourceType)) {
            condition.resourceType = {$ne: omitResourceType};
        }
        if (includes([0, 1], status)) {
            condition.status = status;
        }
        if (isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{resourceName: searchRegExp}, {resourceType: searchRegExp}];
        }
        if (isDate(startCreateDate) && isDate(endCreateDate)) {
            condition.createDate = {$gte: startCreateDate, $lte: endCreateDate};
        } else if (isDate(startCreateDate)) {
            condition.createDate = {$gte: startCreateDate};
        } else if (isDate(endCreateDate)) {
            condition.createDate = {$lte: endCreateDate};
        }
        if (!isEmpty(tags)) {
            condition.tags = {$in: tags};
        }
        const pageResult = await this.resourceService.findIntervalList(condition, skip, limit, projection, sort ?? {updateDate: -1});
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
    @get('/esSearch')
    async esSearch() {

        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').ignoreParamWhenEmpty().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
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
    @get('/search')
    async searchForAdmin() {

        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
        const startCreateDate = ctx.checkQuery('startCreateDate').ignoreParamWhenEmpty().toDate().value;
        const endCreateDate = ctx.checkQuery('endCreateDate').ignoreParamWhenEmpty().toDate().value;
        ctx.validateParams();

        const condition: any = {};
        if (isSelf) {
            ctx.validateVisitorIdentity(IdentityTypeEnum.LoginUser);
            condition.userId = ctx.userId;
        }
        if (isString(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        } else if (isString(omitResourceType)) {
            condition.resourceType = {$ne: omitResourceType};
        }
        if (includes([0, 1], status)) {
            condition.status = status;
        }
        if (isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{resourceName: searchRegExp}, {resourceType: searchRegExp}];
        }
        if (isDate(startCreateDate) && isDate(endCreateDate)) {
            condition.createDate = {$gte: startCreateDate, $lte: endCreateDate};
        } else if (isDate(startCreateDate)) {
            condition.createDate = {$gte: startCreateDate};
        } else if (isDate(endCreateDate)) {
            condition.createDate = {$lte: endCreateDate};
        }
        if (!isEmpty(tags)) {
            condition.tags = {$in: tags};
        }
        const pageResult = await this.resourceService.findIntervalList(condition, skip, limit, projection, sort ?? {updateDate: -1});
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
    @get('/keywordSuggest')
    async keywordSuggest() {
        const {ctx} = this;
        const prefix = ctx.checkQuery('prefix').exist().len(1, 70).value;
        ctx.validateParams();

        await this.elasticSearchService.suggest(prefix).then(ctx.success);
    }

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async create(ctx: FreelogContext) {

        const name = ctx.checkBody('name').exist().isResourceName().trim().value;
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        const intro = ctx.checkBody('intro').optional().default('').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value; // 单个标签长度也限制为20,未实现
        ctx.validateParams();

        if (coverImages.some(x => !isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }

        this._policySchemaValidate(policies, 'addPolicy');

        const {userId, username} = ctx.identityInfo.userInfo;
        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(data => {
            if (isString(data?.resourceName)) {
                throw new ArgumentError(ctx.gettext('name is already existing'));
            }
        });

        const model = {
            userId, username, resourceType, name, intro, coverImages, policies, tags
        };
        await this.resourceService.createResource(model).then(ctx.success);
    }

    @get('/count')
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    async createdCount() {
        const {ctx} = this;
        const userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const list = await this.resourceService.findUserCreatedResourceCounts(userIds.map(x => parseInt(x)));
        ctx.success(userIds.map(userId => {
            const record = list.find(x => x.userId.toString() === userId);
            return {userId: parseInt(userId), createdResourceCount: record?.count ?? 0};
        }));
    }

    @get('/list')
    async list() {

        const {ctx} = this;
        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().decodeURIComponent().toSplitArray().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();

        let dataList = [];
        if (!isEmpty(resourceIds)) {
            dataList = await this.resourceService.find({_id: {$in: resourceIds}}, projection.join(' '));
        } else if (!isEmpty(resourceNames)) {
            dataList = await this.resourceService.findByResourceNames(resourceNames, projection.join(' '));
        } else {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (isLoadPolicyInfo) {
            dataList = await this.resourceService.fillResourcePolicyInfo(dataList, isTranslate);
        }
        if (isLoadLatestVersionInfo) {
            dataList = await this.resourceService.fillResourceLatestVersionInfo(dataList);
        }
        ctx.success(dataList);
    }

    @put('/:resourceId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async update() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const updatePolicies = ctx.checkBody('updatePolicies').optional().isArray().value;
        const addPolicies = ctx.checkBody('addPolicies').optional().isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).value;
        ctx.validateParams();

        if ([updatePolicies, addPolicies, intro, coverImages, tags].every(isUndefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!isEmpty(coverImages) && coverImages.some(x => !isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }

        this._policySchemaValidate(addPolicies, 'addPolicy');
        this._policySchemaValidate(updatePolicies, 'updatePolicy');

        const resourceInfo = await this.resourceService.findOne({_id: resourceId});

        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        const updateResourceOptions = {
            resourceId, intro, coverImages, tags, addPolicies, updatePolicies
        };

        await this.resourceService.updateResource(resourceInfo, updateResourceOptions).then(ctx.success);
    }

    // 批量设置或移除资源标签
    @put('/tags/batchSetOrRemoveResourceTag')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchSetOrRemoveResourceTag() {
        const {ctx} = this;
        const resourceIds = ctx.checkBody('resourceIds').exist().isArray().len(1, 100).value;
        const tagNames = ctx.checkBody('tagNames').exist().isArray().len(1, 100).value;
        const setType = ctx.checkBody('setType').exist().toInt().in([1, 2]).value;
        ctx.validateParams().validateOfficialAuditAccount();

        await this.resourceService.batchSetOrUnsetResourceTag(resourceIds, tagNames, setType).then(ctx.success);
    }

    @get('/:resourceIdOrName/dependencyTree')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async dependencyTree() {
        const {ctx} = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;

        if (CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: {resourceIdOrName}
        });
        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: {version}
        });

        await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
            isContainRootNode, maxDeep, omitFields
        }).then(ctx.success);
    }

    @get('/:resourceIdOrName/authTree')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async authTree() {

        const {ctx} = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        // const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: {resourceIdOrName}
        });
        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: {version}
        });

        await this.resourceService.getResourceAuthTree(versionInfo).then(ctx.success);
    }

    @get('/:resourceIdOrName/relationTree')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async relationTree() {

        const {ctx} = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: {resourceIdOrName}
        });
        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: {version}
        });

        await this.resourceService.getRelationTree(versionInfo).then(ctx.success);
    }

    @get('/:resourceIdOrName')
    async show() {

        const {ctx} = this;
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const isTranslate = ctx.checkQuery('isTranslate').optional().toBoolean().default(false).value;
        ctx.validateParams();

        let resourceInfo = null;
        if (CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '));
        } else if (CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '));
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        if (resourceInfo && isLoadLatestVersionInfo) {
            resourceInfo = await this.resourceService.fillResourceLatestVersionInfo([resourceInfo]).then(first);
        }
        if (resourceInfo && isLoadPolicyInfo) {
            resourceInfo = await this.resourceService.fillResourcePolicyInfo([resourceInfo], isTranslate).then(first);
        }
        ctx.success(resourceInfo);
    }

    @get('/:resourceId/contracts/:contractId/coverageVersions')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async contractCoverageVersions() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractId = ctx.checkParams('contractId').exist().isContractId().value;
        ctx.validateParams();

        const condition = {resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': contractId};

        await this.resourceVersionService.find(condition, 'version versionId').then(ctx.success);
    }

    @get('/:resourceId/contracts/coverageVersions')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async contractsCoverageVersions() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
        ctx.validateParams();

        const condition = {resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': {$in: contractIds}};

        const contractMap: Map<string, any[]> = new Map(contractIds.map(x => [x, []]));
        const dataList = await this.resourceVersionService.find(condition, 'version versionId resolveResources.contracts.contractId');

        for (const resourceVersion of dataList) {
            for (const resolveResource of resourceVersion.resolveResources) {
                for (const contract of resolveResource.contracts) {
                    const list = contractMap.get(contract.contractId);
                    list?.push(pick(resourceVersion, ['version', 'versionId']));
                }
            }
        }

        const result = [];
        for (let [key, value] of contractMap) {
            result.push({contractId: key, versions: uniqBy(value, 'versionId')});
        }
        ctx.success(result);
    }

    // 同一个资源下所有版本解决的子依赖(含上抛)列表以及对应的解决方式
    @get('/:resourceId/resolveResources')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async allResolveResources() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        const resolveResourceMap = new Map();
        const allResourceVersions = await this.resourceVersionService.find({resourceId}, 'version versionId resolveResources');

        for (const resourceVersion of allResourceVersions) {
            for (const resourceResource of resourceVersion.resolveResources) {
                const {resourceId, resourceName, contracts} = resourceResource;
                if (!resolveResourceMap.has(resourceId)) {
                    resolveResourceMap.set(resourceId, {resourceId, resourceName, versions: []});
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
    @get('/files/:fileSha1')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async resourceBySha1() {
        const {ctx} = this;
        const fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const resourceVersions = await this.resourceVersionService.find({fileSha1}, 'resourceId versionId');
        const resourceIds = resourceVersions.map(t => t.resourceId);
        if (!resourceIds.length) {
            return ctx.success([]);
        }
        const resourceVersionIdSet = new Set(resourceVersions.map(x => x.versionId));
        const resources = await this.resourceService.find({_id: {$in: resourceIds}}, projection);
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
    @put('/freeOrRecover/batch')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchFreeOrRecoverResource() {
        const {ctx} = this;
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
    @get('/freeOrRecover/records')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async freeOrRecoverRecords() {
        const {ctx} = this;
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
    _policySchemaValidate(policies: any[], mode: 'addPolicy' | 'updatePolicy') {
        const policyValidateResult = this.resourcePolicyValidator.validate(policies || [], mode);
        if (!isEmpty(policyValidateResult.errors)) {
            throw new ArgumentError(this.ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: policyValidateResult.errors
            });
        }
    }
}
