import * as semver from 'semver';
import {controller, inject, get, post, put, provide} from 'midway';
import {LoginUser, InternalClient, ArgumentError} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {isString, first, isUndefined, includes, pick, uniqBy, isEmpty} from 'lodash';
import {mongoObjectId, fullResourceName} from 'egg-freelog-base/app/extend/helper/common_regex';
import {IJsonSchemaValidate, IResourceService, IResourceVersionService} from '../../interface';

@provide()
@controller('/v2/resources')
export class ResourceController {

    @inject()
    ctx;
    @inject()
    resourceService: IResourceService;
    @inject()
    resourcePolicyValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionService: IResourceVersionService;

    @get('/')
    async index(ctx) {

        const page = ctx.checkQuery('page').optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery('isSelf').optional().default(0).toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        const startResourceId = ctx.checkQuery('startResourceId').optional().isResourceId().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        ctx.validateParams();

        const condition: any = {};
        if (isSelf) {
            ctx.validateVisitorIdentity(LoginUser);
            condition.userId = ctx.userId;
        }
        if (resourceType) {
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        }
        if (includes([0, 1], status)) {
            condition.status = status;
        }
        if (isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            condition.$or = [{resourceName: searchRegExp}, {resourceType: searchRegExp}];
        }
        if (!isUndefined(startResourceId)) {
            condition._id = {$lt: startResourceId};
        }

        const pageResult = await this.resourceService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        if (isLoadPolicyInfo) {
            pageResult.dataList = await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            pageResult.dataList = await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        return ctx.success(pageResult);
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {

        const name = ctx.checkBody('name').exist().isResourceName().value;
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').default('').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value;
        ctx.validateParams();

        if (coverImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
        }

        this._policySchemaValidate(policies, 'addPolicy');

        const {userId, username} = ctx.userInfo;
        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(resourceName => {
            if (resourceName) {
                throw new ArgumentError('name is already existing');
            }
        });

        const model = {
            userId, username, resourceType, name, intro, coverImages, policies, tags
        };
        await this.resourceService.createResource(model).then(ctx.success);
    }

    @get('/list')
    async list(ctx) {

        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().decodeURIComponent().toSplitArray().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
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
            dataList = await this.resourceService.fillResourcePolicyInfo(dataList);
        }
        if (isLoadLatestVersionInfo) {
            dataList = await this.resourceService.fillResourceLatestVersionInfo(dataList);
        }
        ctx.success(dataList);
    }

    @put('/:resourceId')
    @visitorIdentity(LoginUser)
    async update(ctx) {

        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const updatePolicies = ctx.checkBody('updatePolicies').optional().isArray().value;
        const addPolicies = ctx.checkBody('addPolicies').optional().isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(1, 20).value;
        ctx.validateParams();

        if ([updatePolicies, addPolicies, intro, coverImages, tags].every(isUndefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!isEmpty(coverImages) && coverImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
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

    @get('/:resourceIdOrName/dependencyTree')
    @visitorIdentity(LoginUser | InternalClient)
    async dependencyTree(ctx) {

        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'), data: {resourceIdOrName}
        });
        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange)
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'))
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: {version}
        });

        await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
            isContainRootNode, maxDeep, omitFields
        }).then(ctx.success);
    }

    @get('/:resourceIdOrName/authTree')
    @visitorIdentity(LoginUser | InternalClient)
    async authTree(ctx) {

        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        // const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'), data: {resourceIdOrName}
        });
        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange)
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'))
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: {version}
        });

        await this.resourceService.getResourceAuthTree(versionInfo).then(ctx.success);
    }

    @get('/:resourceIdOrName/relationTree')
    @visitorIdentity(LoginUser | InternalClient)
    async relationTree(ctx) {

        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'), data: {resourceIdOrName}
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
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'))
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: {version}
        });

        await this.resourceService.getRelationTree(versionInfo).then(ctx.success);
    }

    @get('/:resourceIdOrName')
    async show(ctx) {

        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        let resourceInfo = null;
        if (mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '));
        } else if (fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '));
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        if (resourceInfo && isLoadLatestVersionInfo) {
            resourceInfo = await this.resourceService.fillResourceLatestVersionInfo([resourceInfo]).then(first);
        }
        if (resourceInfo && isLoadPolicyInfo) {
            resourceInfo = await this.resourceService.fillResourcePolicyInfo([resourceInfo]).then(first);
        }
        ctx.success(resourceInfo);
    }

    @get('/:resourceId/contracts/:contractId/coverageVersions')
    @visitorIdentity(LoginUser)
    async contractCoverageVersions(ctx) {

        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const contractId = ctx.checkParams('contractId').exist().isContractId().value;
        ctx.validateParams();

        const condition = {resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': contractId};

        await this.resourceVersionService.find(condition, 'version versionId').then(ctx.success);
    }

    @get('/:resourceId/contracts/coverageVersions')
    @visitorIdentity(LoginUser)
    async contractsCoverageVersions(ctx) {

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
                    if (list) {
                        list.push(pick(resourceVersion, ['version', 'versionId']));
                    }
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
    @visitorIdentity(LoginUser)
    async allResolveResources(ctx) {

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
     * 策略格式校验
     * @param policies
     * @private
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
