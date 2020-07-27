import {controller, inject, get, post, put, provide} from 'midway';
import {LoginUser, InternalClient, ArgumentError} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IJsonSchemaValidate, IResourceService, IResourceVersionService} from '../../interface';
import {isString, includes, isEmpty} from 'lodash';
import * as semver from 'semver';
import {mongoObjectId, fullResourceName} from 'egg-freelog-base/app/extend/helper/common_regex';

@provide()
@controller('/v2/resources')
export class ResourceController {

    @inject()
    ctx;
    @inject()
    resourcePropertyGenerator;
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
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        ctx.validateParams();

        const condition: any = {};
        if (isSelf) {
            ctx.validateVisitorIdentity(LoginUser);
            condition.userId = ctx.request.userId;
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

        let dataList = [];
        const totalItem = await this.resourceService.count(condition);
        if (totalItem <= (page - 1) * pageSize) {
            return ctx.success({page, pageSize, totalItem, dataList});
        }

        dataList = await this.resourceService.findPageList(condition, page, pageSize, projection, {createDate: -1});
        if (!isLoadLatestVersionInfo || !isEmpty(projection) && (!projection.includes('resourceId') || !projection.includes('latestVersion'))) {
            return ctx.success({page, pageSize, totalItem, dataList});
        }

        const versionIds = dataList.filter(x => !isEmpty(x.latestVersion)).map(resourceInfo => {
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
            resourceInfo.latestVersionId = versionId;
            return versionId;
        });
        if (!isEmpty(versionIds)) {
            const versionInfos = await this.resourceVersionService.find({versionId: {$in: versionIds}});
            dataList = dataList.map(item => {
                const latestVersionInfo = versionInfos.find(x => x.versionId === item.latestVersionId);
                item = item.toObject();
                item.latestVersionInfo = latestVersionInfo;
                return item;
            })
        }

        return ctx.success({page, pageSize, totalItem, dataList});
    }

    /**
     * 创建资源,区别于旧版本,现在资源可以先创建,后添加版本.
     * 只有具有正式版本,且具有策略,才代表资源上架
     * @param ctx
     * @returns {Promise<void>}
     */
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

        const policyValidateResult = this.resourcePolicyValidator.validate(policies);
        if (!isEmpty(policyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: policyValidateResult.errors
            });
        }

        const {userId, username} = ctx.request.identityInfo.userInfo;
        const model = {
            userId, username, resourceType, name, intro, coverImages, policies, tags
        };

        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(resourceName => {
            if (resourceName) {
                throw new ArgumentError('name is already existing');
            }
        });

        await this.resourceService.createResource(model).then(ctx.success);
    }

    @get('/list')
    async list(ctx) {
        const resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().toSplitArray().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        if (!isEmpty(resourceIds)) {
            await this.resourceService.find({_id: {$in: resourceIds}}, projection.join(' ')).then(ctx.success);
        } else if (!isEmpty(resourceNames)) {
            await this.resourceService.findByResourceNames(resourceNames, projection.join(' ')).then(ctx.success);
        } else {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
    }

    @put('/:resourceId')
    @visitorIdentity(LoginUser)
    async update(ctx) {
        const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
        const policyChangeInfo = ctx.checkBody('policyChangeInfo').optional().isObject().value;
        const intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
        const tags = ctx.checkBody('tags').optional().isArray().len(1, 20).value;
        ctx.validateParams();

        if ([policyChangeInfo, intro, coverImages].every(x => x === undefined)) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        if (!isEmpty(coverImages) && coverImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'));
        }

        const resourceInfo = await this.resourceService.findOne({_id: resourceId});
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        const updateResourceOptions = {
            resourceId, intro, coverImages, policyChangeInfo, tags
        };

        await this.resourceService.updateResource(updateResourceOptions).then(ctx.success);
    }

    @get('/:resourceId/dependencyTree')
    @visitorIdentity(LoginUser | InternalClient)
    async dependencyTree(ctx) {

        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        const maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
        const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'), data: {resourceId}
        });

        const {versionId} = this._getResourceVersionInfo(resourceInfo, version) || {};
        if (!versionId) {
            return ctx.success([]);
        }
        const versionInfo = await this.resourceVersionService.findOne({versionId});

        await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
            isContainRootNode, maxDeep, omitFields
        }).then(ctx.success);
    }

    @get('/:resourceId/authTree')
    @visitorIdentity(LoginUser | InternalClient)
    async authTree(ctx) {

        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'), data: {resourceId}
        });

        const {versionId} = this._getResourceVersionInfo(resourceInfo, version) || {};
        if (!versionId) {
            return ctx.success([]);
        }
        const versionInfo = await this.resourceVersionService.findOne({versionId});

        await this.resourceService.getResourceAuthTree(resourceInfo, versionInfo).then(ctx.success);
    }

    @get('/:resourceIdOrName')
    async show(ctx) {
        const resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
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

        if (!resourceInfo) {
            return ctx.success(null);
        }
        resourceInfo = resourceInfo.toObject();
        if (isLoadLatestVersionInfo && resourceInfo.latestVersion) {
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
            resourceInfo.latestVersionInfo = await this.resourceVersionService.findOne({versionId});
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
            throw new ArgumentError(this.ctx.gettext('params-validate-failed', 'version'));
        }
        if (!version) {
            version = resourceInfo.latestVersion;
        }
        return resourceInfo.resourceVersions.find(x => x.version === semver.clean(version));
    }
}
