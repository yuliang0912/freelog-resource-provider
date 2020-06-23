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
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
let ResourceVersionController = /** @class */ (() => {
    let ResourceVersionController = class ResourceVersionController {
        async index(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            ctx.validateParams();
            await this.resourceVersionService.find({ resourceId }, projection.join(' ')).then(ctx.success);
        }
        async show(ctx) {
            const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
            const version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
            const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
            ctx.validateParams();
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
            await this.resourceVersionService.findOne({ versionId }, projection.join(' ')).then(ctx.success);
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
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastReleases'), {
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
            const fileSystemProperty = await ctx.curlIntranetApi(`${ctx.webApi.storageInfo}/files/${fileSha1}/property?resourceType=${resourceInfo.resourceType}`);
            if (!fileSystemProperty) {
                throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'fileSha1'));
            }
            // 目前允许同一个文件被当做资源的多个版本.也允许同一个文件加入多个资源.但是不可以跨越用户.
            const existResourceVersion = await this.resourceVersionService.findOne({
                fileSha1, userId: { $ne: ctx.request.userId }
            });
            if (existResourceVersion) {
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
                version: semver.clean(version), fileSha1, description,
                resolveResources, dependencies, customPropertyDescriptors, baseUpcastResources,
                systemProperty: fileSystemProperty,
                versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version),
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
        async update(ctx) {
            const resourceId = ctx.checkParams('resourceId').exist().isMongoObjectId().value;
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
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
            const resourceVersion = await this.resourceVersionService.findOne({ versionId });
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
    ], ResourceVersionController.prototype, "resourcePropertyGenerator", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceVersionController.prototype, "resourceService", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceVersionController.prototype, "resourceUpcastValidator", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceVersionController.prototype, "resourceVersionService", void 0);
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
    ], ResourceVersionController.prototype, "customPropertyValidator", void 0);
    __decorate([
        midway_1.get('/:resourceId/versions'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceVersionController.prototype, "index", null);
    __decorate([
        midway_1.get('/:resourceId/versions/:version'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser | egg_freelog_base_1.InternalClient),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceVersionController.prototype, "show", null);
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
        midway_1.post('/:resourceId/versions'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceVersionController.prototype, "create", null);
    __decorate([
        midway_1.get('/files/:fileSha1/versions'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceVersionController.prototype, "versionsBySha1", null);
    __decorate([
        midway_1.put('/:resourceId/versions/:version'),
        vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Promise)
    ], ResourceVersionController.prototype, "update", null);
    ResourceVersionController = __decorate([
        midway_1.provide(),
        midway_1.priority(1),
        midway_1.controller('/v1/resources')
    ], ResourceVersionController);
    return ResourceVersionController;
})();
exports.ResourceVersionController = ResourceVersionController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBK0I7QUFDL0IsbUNBQTZFO0FBQzdFLHVEQUE0RjtBQUM1RixrRkFBcUU7QUFNckU7SUFBQSxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtRQW1CbEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO1lBQ1gsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDekUsTUFBTSxVQUFVLEdBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3RHLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNyQixNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxVQUFVLEVBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBSUQsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHO1lBQ1YsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDekUsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxD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