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
exports.ResourceVersionController = void 0;
const semver = require("semver");
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceVersionController = class ResourceVersionController {
    async index(ctx) {
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({ resourceId }, projection.join(' ')).then(ctx.success);
    }
    async detail(ctx) {
        const versionId = ctx.checkQuery('versionId').isMd5().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.findOne({ versionId }, projection.join(' ')).then(ctx.success);
    }
    async list(ctx) {
        const versionIds = ctx.checkQuery('versionIds').exist().toSplitArray().len(1, 100).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({ versionId: { $in: versionIds } }, projection.join(' ')).then(ctx.success);
    }
    async resourceVersionDraft(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        await this.resourceVersionService.getResourceVersionDraft(resourceId).then(ctx.success);
    }
    async create(ctx) {
        const fileSha1 = ctx.checkBody('fileSha1').exist().isSha1().toLowercase().value;
        const filename = ctx.checkBody('filename').exist().type('string').len(1, 200).value;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const resolveResources = ctx.checkBody('resolveResources').exist().isArray().value; // 单一资源传递空数组.
        const version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const description = ctx.checkBody('description').optional().type('string').default('').value;
        const dependencies = ctx.checkBody('dependencies').optional().isArray().default([]).value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().default([]).value;
        //  资源的第一个版本才需要此参数,其他版本此参数将被忽略
        const baseUpcastResources = ctx.checkBody('baseUpcastResources').optional().isArray().default([]).value;
        ctx.validateParams();
        const resolveResourceValidateResult = await this.resolveDependencyOrUpcastValidator.validate(resolveResources);
        if (!lodash_1.isEmpty(resolveResourceValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                errors: resolveResourceValidateResult.errors
            });
        }
        const dependencyValidateResult = await this.resourceVersionDependencyValidator.validate(dependencies);
        if (!lodash_1.isEmpty(dependencyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: dependencyValidateResult.errors
            });
        }
        const upcastResourceValidateResult = await this.resourceUpcastValidator.validate(baseUpcastResources);
        if (!lodash_1.isEmpty(upcastResourceValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastResources'), {
                errors: upcastResourceValidateResult.errors
            });
        }
        const customPropertyDescriptorValidateResult = await this.customPropertyValidator.validate(customPropertyDescriptors);
        if (!lodash_1.isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }
        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        const fileSystemProperty = await this.outsideApiService.getFileObjectProperty(fileSha1, resourceInfo.resourceType);
        if (!fileSystemProperty) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'fileSha1'));
        }
        // 目前允许同一个文件被当做资源的多个版本.也允许同一个文件加入多个资源.但是不可以跨越用户.
        const isCanBeCreate = await this.resourceVersionService.checkFileIsCanBeCreate(fileSha1);
        if (!isCanBeCreate) {
            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('resource-create-duplicate-error'));
        }
        // 通过version库对比而非resourceInfo.resourceVersions.是因为后期可能版本并非直接进入资源版本属性中,需要等状态就绪,才会进入版本集
        const resourceVersions = await this.resourceVersionService.find({ resourceId }, 'version', { createDate: -1 });
        if (resourceVersions.some(x => x.version === semver.clean(version))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('resource-version-existing-error'));
        }
        if (!lodash_1.isEmpty(resourceVersions) && resourceVersions.every(x => semver.gt(x.version, version))) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('resource-version-must-be-greater-than-latest-version'));
        }
        const versionInfo = {
            version: semver.clean(version), fileSha1, filename, description,
            resolveResources, dependencies, customPropertyDescriptors, baseUpcastResources,
            systemProperty: fileSystemProperty
        };
        await this.resourceVersionService.createResourceVersion(resourceInfo, versionInfo).then(ctx.success);
    }
    // 根据fileSha1查询所加入的资源以及具体版本信息,例如用户存储对象需要查询所加入的资源
    async versionsBySha1(ctx) {
        const fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.find({
            fileSha1,
            userId: ctx.request.userId
        }, projection.join(' ')).then(ctx.success);
    }
    async createOrUpdateResourceVersionDraft(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const draftData = ctx.checkBody('draftData').exist().isObject().value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        // 一个资源只能保存一次草稿.
        await this.resourceVersionService.saveOrUpdateResourceVersionDraft(resourceInfo, draftData).then(ctx.success);
    }
    async validateResourceVersionDependencies(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const dependencies = ctx.checkBody('dependencies').exist().isArray().len(1).value;
        ctx.validateParams();
        const dependencyValidateResult = await this.resourceVersionDependencyValidator.validate(dependencies);
        if (!lodash_1.isEmpty(dependencyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                errors: dependencyValidateResult.errors
            });
        }
        const cycleDependCheckResult = await this.resourceVersionService.cycleDependCheck(resourceId, dependencies, 1);
        ctx.success(Boolean(!cycleDependCheckResult.ret));
    }
    async show(ctx) {
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceVersionService.findOneByVersion(resourceId, version, projection.join(' ')).then(ctx.success);
    }
    async download(ctx) {
        const resourceId = ctx.checkParams('resourceId').isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'userId fileSha1 filename resourceName version systemProperty');
        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersionInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId,version') });
        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
    async fileIsCanBeCreate(ctx) {
        const fileSha1 = ctx.checkQuery('fileSha1').exist().isSha1().toLowercase().value;
        ctx.validateParams();
        await this.resourceVersionService.checkFileIsCanBeCreate(fileSha1).then(ctx.success);
    }
    async batchSignAndSetContractToVersion(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const subjects = ctx.checkBody('subjects').exist().isArray().value;
        ctx.validateParams();
        const subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
        if (!lodash_1.isEmpty(subjectValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: subjectValidateResult.errors
            });
        }
        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
        await this.resourceVersionService.batchSetPolicyToVersions(resourceInfo, subjects).then(ctx.success);
    }
    async update(ctx) {
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const resolveResources = ctx.checkBody('resolveResources').optional().isArray().value;
        const description = ctx.checkBody('description').optional().type('string').value;
        const customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().value;
        ctx.validateParams();
        const resolveResourceValidateResult = await this.resolveDependencyOrUpcastValidator.validate(resolveResources);
        if (!lodash_1.isEmpty(resolveResources) && !lodash_1.isEmpty(resolveResourceValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                errors: resolveResourceValidateResult.errors
            });
        }
        const customPropertyDescriptorValidateResult = await this.customPropertyValidator.validate(customPropertyDescriptors);
        if (!lodash_1.isEmpty(customPropertyDescriptors) && !lodash_1.isEmpty(customPropertyDescriptorValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                errors: customPropertyDescriptorValidateResult.errors
            });
        }
        const resourceVersion = await this.resourceVersionService.findOneByVersion(resourceId, version);
        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersion, { msg: ctx.gettext('params-validate-failed', 'resourceId,version') });
        const options = {
            description, resolveResources, customPropertyDescriptors
        };
        await this.resourceVersionService.updateResourceVersion(resourceVersion, options).then(ctx.success);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "resourceService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "resourceVersionService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "customPropertyValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "resourceUpcastValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "resolveDependencyOrUpcastValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "resourceVersionDependencyValidator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionController.prototype, "batchSignSubjectValidator", void 0);
__decorate([
    midway_1.get('/:resourceId/versions'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "index", null);
__decorate([
    midway_1.get('/versions/detail'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "detail", null);
__decorate([
    midway_1.get('/versions/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "list", null);
__decorate([
    midway_1.get('/:resourceId/versions/drafts'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "resourceVersionDraft", null);
__decorate([
    midway_1.post('/:resourceId/versions'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "create", null);
__decorate([
    midway_1.get('/files/:fileSha1/versions'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "versionsBySha1", null);
__decorate([
    midway_1.post('/:resourceId/versions/drafts'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "createOrUpdateResourceVersionDraft", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.post('/:resourceId/versions/cycleDependencyCheck'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "validateResourceVersionDependencies", null);
__decorate([
    midway_1.get('/:resourceId/versions/:version'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "show", null);
__decorate([
    midway_1.get('/:resourceId/versions/:version/download'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "download", null);
__decorate([
    midway_1.get('/versions/isCanBeCreate'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "fileIsCanBeCreate", null);
__decorate([
    midway_1.put('/:resourceId/versions/batchSetContracts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "batchSignAndSetContractToVersion", null);
__decorate([
    midway_1.put('/:resourceId/versions/:version'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceVersionController.prototype, "update", null);
ResourceVersionController = __decorate([
    midway_1.provide(),
    midway_1.priority(1),
    midway_1.controller('/v2/resources')
], ResourceVersionController);
exports.ResourceVersionController = ResourceVersionController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBK0I7QUFDL0IsbUNBQTZFO0FBQzdFLHVEQUcwQjtBQU0xQixJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQXVCbEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1FBQ1gsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDdEUsTUFBTSxVQUFVLEdBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3RHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxVQUFVLEVBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBR0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1FBQ1osTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxVQUFVLEdBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3RHLEdBQUcsQ0FB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