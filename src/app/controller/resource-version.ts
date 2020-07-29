import * as semver from 'semver';
import {isEmpty} from 'lodash';
import {controller, get, put, post, inject, provide, priority} from 'midway';
import {LoginUser, InternalClient, ArgumentError, ApplicationError} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IJsonSchemaValidate, IResourceService, IResourceVersionService} from '../../interface';

@provide()
@priority(1)
@controller('/v2/resources')
export class ResourceVersionController {

    @inject()
    resourcePropertyGenerator;
    @inject()
    resourceService: IResourceService;
    @inject()
    resourceUpcastValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionService: IResourceVersionService;
    @inject()
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    @inject()
    customPropertyValidator: IJsonSchemaValidate;

    @get('/:resourceId/versions')
    @visitorIdentity(LoginUser | InternalClient)
    async index(ctx) {
        const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({resourceId}, projection.join(' ')).then(ctx.success);
    }

    @get('/versions/detail')
    async detail(ctx) {
        const versionId = ctx.checkQuery('versionId').isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.findOne({versionId}, projection.join(' ')).then(ctx.success);
    }

    @get('/versions/list')
    async list(ctx) {
        const versionIds = ctx.checkQuery('versionIds').exist().toSplitArray().len(1, 100).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({versionId: {$in: versionIds}}, projection.join(' ')).then(ctx.success);
    }

    /**
     * 保存草稿.一个资源只能保存一次草稿
     * @param ctx
     * @returns {Promise<void>}
     */
    @get('/:resourceId/versions/drafts')
    @visitorIdentity(LoginUser)
    async resourceVersionDraft(ctx) {

        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        await this.resourceVersionService.getResourceVersionDraft(resourceId).then(ctx.success);
    }

    @post('/:resourceId/versions')
    @visitorIdentity(LoginUser)
    async create(ctx) {
        const fileSha1 = ctx.checkBody('fileSha1').exist().isSha1().toLowercase().value;
        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        const resolveResources = ctx.checkBody('resolveResources').exist().isArray().value; // 单一资源传递空数组.
        const version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const description = ctx.checkBody('description').optional().type('string').default('').value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().default([]).value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().default([]).value;
        //  资源的第一个版本才需要此参数,其他版本此参数将被忽略
        const baseUpcastResources = ctx.checkBody('baseUpcastResources').optional().isArray().default([]).value;
        ctx.validateParams();

        const resolveResourceValidateResult = await this.resolveDependencyOrUpcastValidator.validate(resolveResources);
        if (!isEmpty(resolveResourceValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                errors: resolveResourceValidateResult.errors
            });
        }

        const dependencyValidateResult = await this.resourceVersionDependencyValidator.validate(dependencies);
        if (!isEmpty(dependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: dependencyValidateResult.errors
            });
        }

        const upcastResourceValidateResult = await this.resourceUpcastValidator.validate(baseUpcastResources);
        if (!isEmpty(upcastResourceValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastResources'), {
                errors: upcastResourceValidateResult.errors
            });
        }

        const customPropertyDescriptorValidateResult = await this.customPropertyValidator.validate(customPropertyDescriptors);
        if (!isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        const fileSystemProperty = await ctx.curlIntranetApi(`${ctx.webApi.storageInfo}/files/${fileSha1}/property?resourceType=${resourceInfo.resourceType}`);
        if (!fileSystemProperty) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'fileSha1'));
        }

        // 目前允许同一个文件被当做资源的多个版本.也允许同一个文件加入多个资源.但是不可以跨越用户.
        const isCanBeCreate = await this.resourceVersionService.checkFileIsCanBeCreate(fileSha1);
        if (!isCanBeCreate) {
            throw new ApplicationError(ctx.gettext('resource-create-duplicate-error'));
        }

        // 通过version库对比而非resourceInfo.resourceVersions.是因为后期可能版本并非直接进入资源版本属性中,需要等状态就绪,才会进入版本集
        const resourceVersions = await this.resourceVersionService.find({resourceId}, 'version', {createDate: -1});
        if (resourceVersions.some(x => x.version === semver.clean(version))) {
            throw new ArgumentError(ctx.gettext('resource-version-existing-error'));
        }
        if (!isEmpty(resourceVersions) && resourceVersions.every(x => semver.gt(x.version, version))) {
            throw new ArgumentError(ctx.gettext('resource-version-must-be-greater-than-latest-version'));
        }

        const versionInfo = {
            version: semver.clean(version), fileSha1, description,
            resolveResources, dependencies, customPropertyDescriptors, baseUpcastResources,
            systemProperty: fileSystemProperty,
            versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version),
        };

        await this.resourceVersionService.createResourceVersion(resourceInfo, versionInfo).then(ctx.success);
    }

    // 根据fileSha1查询所加入的资源以及具体版本信息,例如用户存储对象需要查询所加入的资源
    @get('/files/:fileSha1/versions')
    @visitorIdentity(LoginUser)
    async versionsBySha1(ctx) {
        const fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.resourceVersionService.find({
            fileSha1,
            userId: ctx.request.userId
        }, projection.join(' ')).then(ctx.success);
    }

    @put('/:resourceId/versions/:version')
    @visitorIdentity(LoginUser)
    async update(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const resolveResources = ctx.checkBody('resolveResources').optional().isArray().value;
        const description = ctx.checkBody('description').optional().type('string').value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().value;
        ctx.validateParams();

        const resolveResourceValidateResult = await this.resolveDependencyOrUpcastValidator.validate(resolveResources);
        if (!isEmpty(resolveResources) && !isEmpty(resolveResourceValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                errors: resolveResourceValidateResult.errors
            });
        }

        const customPropertyDescriptorValidateResult = await this.customPropertyValidator.validate(customPropertyDescriptors);
        if (!isEmpty(customPropertyDescriptors) && !isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }

        const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
        const resourceVersion = await this.resourceVersionService.findOne({versionId});
        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersion, {msg: ctx.gettext('params-validate-failed', 'resourceId,version')});

        const options = {
            description, resolveResources, customPropertyDescriptors
        };
        await this.resourceVersionService.updateResourceVersion(resourceVersion, options).then(ctx.success);
    }

    /**
     * 保存草稿.一个资源只能保存一次草稿
     * @param ctx
     * @returns {Promise<void>}
     */
    @post('/:resourceId/versions/drafts')
    @visitorIdentity(LoginUser)
    async createResourceVersionDraft(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
        const fileSha1 = ctx.checkBody('fileSha1').optional().isSha1().toLowercase().default('').value;
        const resolveResources = ctx.checkBody('resolveResources').optional().isArray().default([]).value; // 单一资源传递空数组.
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const description = ctx.checkBody('description').optional().type('string').default('').value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().default([]).value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().default([]).value;
        const baseUpcastResources = ctx.checkBody('baseUpcastResources').optional().isArray().default([]).value;
        ctx.validateParams();

        const resolveResourceValidateResult = await this.resolveDependencyOrUpcastValidator.validate(resolveResources);
        if (!isEmpty(resolveResourceValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                errors: resolveResourceValidateResult.errors
            });
        }

        const dependencyValidateResult = await this.resourceVersionDependencyValidator.validate(dependencies);
        if (!isEmpty(dependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: dependencyValidateResult.errors
            });
        }

        const upcastResourceValidateResult = await this.resourceUpcastValidator.validate(baseUpcastResources);
        if (!isEmpty(upcastResourceValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastReleases'), {
                errors: upcastResourceValidateResult.errors
            });
        }

        const customPropertyDescriptorValidateResult = await this.customPropertyValidator.validate(customPropertyDescriptors);
        if (!isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        // 目前允许同一个文件被当做资源的多个版本.也允许同一个文件加入多个资源.但是不可以跨越用户.
        const existResourceVersion = await this.resourceVersionService.findOne({
            fileSha1, userId: {$ne: ctx.request.userId}
        });
        if (existResourceVersion) {
            throw new ApplicationError(ctx.gettext('resource-create-duplicate-error'));
        }

        // 通过version库对比而非resourceInfo.resourceVersions.是因为后期可能版本并非直接进入资源版本属性中,需要等状态就绪,才会进入版本集
        const resourceVersions = await this.resourceVersionService.find({resourceId}, 'version', {createDate: -1});
        if (resourceVersions.some(x => x.version === semver.clean(version))) {
            throw new ArgumentError(ctx.gettext('resource-version-existing-error'));
        }
        if (!isEmpty(resourceVersions) && resourceVersions.every(x => semver.gt(x.version, version))) {
            throw new ArgumentError(ctx.gettext('resource-version-must-be-greater-than-latest-version'));
        }

        const versionInfo = {
            version: semver.clean(version), fileSha1, description,
            resolveResources, dependencies, customPropertyDescriptors, baseUpcastResources,
            versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version),
        };

        await this.resourceVersionService.saveOrUpdateResourceVersionDraft(resourceInfo, versionInfo).then(ctx.success);
    }

    @get('/:resourceId/versions/:version')
    @visitorIdentity(LoginUser | InternalClient)
    async show(ctx) {
        const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
        await this.resourceVersionService.findOne({versionId}, projection.join(' ')).then(ctx.success);
    }

    /**
     * 验证文件是否可以被创建成资源版本
     */
    @get('/versions/isCanBeCreate')
    @visitorIdentity(LoginUser)
    async fileIsCanBeCreate(ctx) {
        const fileSha1 = ctx.checkQuery('fileSha1').exist().isSha1().toLowercase().value;
        ctx.validateParams();

        await this.resourceVersionService.checkFileIsCanBeCreate(fileSha1).then(ctx.success);
    }
}
