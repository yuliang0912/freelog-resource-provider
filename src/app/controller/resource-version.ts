import {isEmpty} from 'lodash';
import * as semver from 'semver';
import {controller, get, put, post, inject, provide, priority} from 'midway';
import {IResourceService, IResourceVersionService, IOutsideApiService} from '../../interface';
import {
    IdentityTypeEnum,
    visitorIdentityValidator,
    FreelogContext,
    ArgumentError,
    ApplicationError,
    IJsonSchemaValidate
} from 'egg-freelog-base';
import {ResourcePropertyGenerator} from '../../extend/resource-property-generator';

@provide()
@priority(1)
@controller('/v2/resources')
export class ResourceVersionController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    customPropertyValidator: IJsonSchemaValidate;
    @inject()
    resourceUpcastValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionService: IResourceVersionService;
    @inject()
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    @inject()
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    @inject()
    batchSignSubjectValidator: IJsonSchemaValidate;
    @inject()
    resourcePropertyGenerator: ResourcePropertyGenerator;

    @get('/:resourceId/versions')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async index() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({resourceId}, projection.join(' ')).then(ctx.success);
    }

    @get('/versions/detail')
    async detail() {
        const {ctx} = this;
        const versionId = ctx.checkQuery('versionId').isMd5().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.findOne({versionId}, projection.join(' ')).then(ctx.success);
    }

    @get('/versions/list')
    async list() {
        const {ctx} = this;
        const versionIds = ctx.checkQuery('versionIds').exist().toSplitArray().len(1, 100).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({versionId: {$in: versionIds}}, projection.join(' ')).then(ctx.success);
    }

    @get('/:resourceId/versions/drafts')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async resourceVersionDraft() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        await this.resourceVersionService.getResourceVersionDraft(resourceId).then(ctx.success);
    }

    @post('/:resourceId/versions')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async create() {

        const {ctx} = this;
        const fileSha1 = ctx.checkBody('fileSha1').exist().isSha1().toLowercase().value;
        const filename = ctx.checkBody('filename').exist().type('string').len(1, 200).value;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const resolveResources = ctx.checkBody('resolveResources').exist().isArray().value; // 单一资源传递空数组.
        const version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const description = ctx.checkBody('description').optional().type('string').default('').value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().default([]).value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().default([]).value;
        // 资源的第一个版本才需要此参数,其他版本此参数将被忽略
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

        const fileSystemProperty = await this.outsideApiService.getFileObjectProperty(fileSha1, resourceInfo.resourceType);
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

        Object.assign(fileSystemProperty, {mime: this.resourcePropertyGenerator.getResourceMimeType(filename)});

        const versionInfo = {
            version: semver.clean(version), fileSha1, filename, description,
            resolveResources, dependencies, customPropertyDescriptors, baseUpcastResources,
            systemProperty: fileSystemProperty
        };

        await this.resourceVersionService.createResourceVersion(resourceInfo, versionInfo).then(ctx.success);
    }

    // 根据fileSha1查询所加入的资源以及具体版本信息,例如用户存储对象需要查询所加入的资源
    @get('/files/:fileSha1/versions')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async versionsBySha1() {
        const {ctx} = this;
        const fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.resourceVersionService.find({
            fileSha1,
            userId: ctx.userId
        }, projection.join(' ')).then(ctx.success);
    }

    @post('/:resourceId/versions/drafts')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async createOrUpdateResourceVersionDraft() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const draftData = ctx.checkBody('draftData').exist().isObject().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        // 一个资源只能保存一次草稿.
        await this.resourceVersionService.saveOrUpdateResourceVersionDraft(resourceInfo, draftData).then(ctx.success);
    }

    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    @post('/:resourceId/versions/cycleDependencyCheck')
    async validateResourceVersionDependencies() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const dependencies = ctx.checkBody('dependencies').exist().isArray().len(1).value;
        ctx.validateParams();

        const dependencyValidateResult = await this.resourceVersionDependencyValidator.validate(dependencies);
        if (!isEmpty(dependencyValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: dependencyValidateResult.errors
            });
        }

        const cycleDependCheckResult = await this.resourceVersionService.cycleDependCheck(resourceId, dependencies, 1);

        ctx.success(Boolean(!cycleDependCheckResult.ret));
    }

    @get('/:resourceId/versions/:version')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async show() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        await this.resourceVersionService.findOneByVersion(resourceId, version, projection.join(' ')).then(ctx.success);
    }

    @get('/:resourceId/versions/:version/download')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async download() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'userId fileSha1 filename resourceName version systemProperty');
        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersionInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId,version')});

        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);

        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize.toString());
        ctx.attachment(fileStreamInfo.fileName);
    }

    @get('/versions/:versionId/internalClientDownload')
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient)
    async internalClientDownload() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'userId fileSha1 filename resourceName version systemProperty');
        ctx.entityNullObjectCheck(resourceVersionInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId,version')});

        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);

        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize.toString());
        ctx.set('content-type', fileStreamInfo.contentType);
        ctx.attachment(fileStreamInfo.fileName);
    }

    @get('/versions/isCanBeCreate')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async fileIsCanBeCreate() {
        const {ctx} = this;
        const fileSha1 = ctx.checkQuery('fileSha1').exist().isSha1().toLowercase().value;
        ctx.validateParams();

        await this.resourceVersionService.checkFileIsCanBeCreate(fileSha1).then(ctx.success);
    }

    @put('/:resourceId/versions/batchSetContracts')
    async batchSignAndSetContractToVersion() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        ctx.validateParams();

        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!isEmpty(subjectValidateResult.errors)) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, {msg: ctx.gettext('params-validate-failed', 'resourceId')});

        await this.resourceVersionService.batchSetPolicyToVersions(resourceInfo, subjects).then(ctx.success);
    }

    @put('/:resourceId/versions/:version')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async update() {
        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
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

        const resourceVersion = await this.resourceVersionService.findOneByVersion(resourceId, version);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersion, {msg: ctx.gettext('params-validate-failed', 'resourceId,version')});

        const options = {
            description, resolveResources, customPropertyDescriptors
        };
        await this.resourceVersionService.updateResourceVersion(resourceVersion, options).then(ctx.success);
    }
}
