"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ResourceVersionController = void 0;
var lodash_1 = require("lodash");
var semver = require("semver");
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceVersionController = /** @class */ (function () {
    function ResourceVersionController() {
    }
    ResourceVersionController.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, projection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').isResourceId().value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.find({ resourceId: resourceId }, projection.join(' ')).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.detail = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, versionId, projection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        versionId = ctx.checkQuery('versionId').isMd5().value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.findOne({ versionId: versionId }, projection.join(' ')).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, versionIds, projection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        versionIds = ctx.checkQuery('versionIds').exist().toSplitArray().len(1, 100).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.find({ versionId: { $in: versionIds } }, projection.join(' ')).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.resourceVersionDraft = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
                        return [4 /*yield*/, this.resourceVersionService.getResourceVersionDraft(resourceId).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.create = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, fileSha1, filename, resourceId, resolveResources, version, description, dependencies, customPropertyDescriptors, baseUpcastResources, resolveResourceValidateResult, dependencyValidateResult, upcastResourceValidateResult, customPropertyDescriptorValidateResult, resourceInfo, fileSystemProperty, isCanBeCreate, resourceVersions, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        fileSha1 = ctx.checkBody('fileSha1').exist().isSha1().toLowercase().value;
                        filename = ctx.checkBody('filename').exist().type('string').len(1, 200).value;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        resolveResources = ctx.checkBody('resolveResources').exist().isArray().value;
                        version = ctx.checkBody('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        description = ctx.checkBody('description').optional().type('string')["default"]('').value;
                        dependencies = ctx.checkBody('dependencies').optional().isArray()["default"]([]).value;
                        customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray()["default"]([]).value;
                        baseUpcastResources = ctx.checkBody('baseUpcastResources').optional().isArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resolveDependencyOrUpcastValidator.validate(resolveResources)];
                    case 1:
                        resolveResourceValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(resolveResourceValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                                errors: resolveResourceValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.resourceVersionDependencyValidator.validate(dependencies)];
                    case 2:
                        dependencyValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(dependencyValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                                errors: dependencyValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.resourceUpcastValidator.validate(baseUpcastResources)];
                    case 3:
                        upcastResourceValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(upcastResourceValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'baseUpcastResources'), {
                                errors: upcastResourceValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.customPropertyValidator.validate(customPropertyDescriptors)];
                    case 4:
                        customPropertyDescriptorValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(customPropertyDescriptorValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                                errors: customPropertyDescriptorValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 5:
                        resourceInfo = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
                        return [4 /*yield*/, this.outsideApiService.getFileObjectProperty(fileSha1, resourceInfo.resourceType)];
                    case 6:
                        fileSystemProperty = _a.sent();
                        if (!fileSystemProperty) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'fileSha1'));
                        }
                        return [4 /*yield*/, this.resourceVersionService.checkFileIsCanBeCreate(fileSha1)];
                    case 7:
                        isCanBeCreate = _a.sent();
                        if (!isCanBeCreate) {
                            throw new egg_freelog_base_1.ApplicationError(ctx.gettext('resource-create-duplicate-error'));
                        }
                        return [4 /*yield*/, this.resourceVersionService.find({ resourceId: resourceId }, 'version', { createDate: -1 })];
                    case 8:
                        resourceVersions = _a.sent();
                        if (resourceVersions.some(function (x) { return x.version === semver.clean(version); })) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('resource-version-existing-error'));
                        }
                        if (!(0, lodash_1.isEmpty)(resourceVersions) && resourceVersions.every(function (x) { return semver.gt(x.version, version); })) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('resource-version-must-be-greater-than-latest-version'));
                        }
                        Object.assign(fileSystemProperty, { mime: this.resourcePropertyGenerator.getResourceMimeType(filename) });
                        versionInfo = {
                            version: semver.clean(version),
                            fileSha1: fileSha1,
                            filename: filename,
                            description: description,
                            resolveResources: resolveResources,
                            dependencies: dependencies,
                            customPropertyDescriptors: customPropertyDescriptors,
                            baseUpcastResources: baseUpcastResources,
                            systemProperty: fileSystemProperty
                        };
                        return [4 /*yield*/, this.resourceVersionService.createResourceVersion(resourceInfo, versionInfo).then(ctx.success)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 根据fileSha1查询所加入的资源以及具体版本信息,例如用户存储对象需要查询所加入的资源
    ResourceVersionController.prototype.versionsBySha1 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, fileSha1, projection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.find({
                                fileSha1: fileSha1,
                                userId: ctx.userId
                            }, projection.join(' ')).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 获取版本属性
    ResourceVersionController.prototype.versionProperty = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, version, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').isResourceId().value;
                        version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version)];
                    case 1:
                        versionInfo = _a.sent();
                        if (!versionInfo) {
                            return [2 /*return*/, ctx.success({})];
                        }
                        ctx.success(this.resourceVersionService.calculateResourceVersionProperty(versionInfo));
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.createOrUpdateResourceVersionDraft = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, draftData, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        draftData = ctx.checkBody('draftData').exist().isObject().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
                        // 一个资源只能保存一次草稿.
                        return [4 /*yield*/, this.resourceVersionService.saveOrUpdateResourceVersionDraft(resourceInfo, draftData).then(ctx.success)];
                    case 2:
                        // 一个资源只能保存一次草稿.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.validateResourceVersionDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, dependencies, dependencyValidateResult, cycleDependCheckResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        dependencies = ctx.checkBody('dependencies').exist().isArray().len(1).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionDependencyValidator.validate(dependencies)];
                    case 1:
                        dependencyValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(dependencyValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'dependencies'), {
                                errors: dependencyValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.resourceVersionService.cycleDependCheck(resourceId, dependencies, 1)];
                    case 2:
                        cycleDependCheckResult = _a.sent();
                        ctx.success(Boolean(!cycleDependCheckResult.ret));
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, version, projection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').isResourceId().value;
                        version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version, projection.join(' ')).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.download = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, version, resourceVersionInfo, fileStreamInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').isResourceId().value;
                        version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version, 'userId fileSha1 filename resourceName version systemProperty')];
                    case 1:
                        resourceVersionInfo = _a.sent();
                        ctx.entityNullObjectCheck(resourceVersionInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId,version') });
                        if (!ctx.isInternalClient()) {
                            ctx.entityNullValueAndUserAuthorizationCheck(resourceVersionInfo, { msg: ctx.gettext('user-authorization-failed') });
                        }
                        return [4 /*yield*/, this.resourceVersionService.getResourceFileStream(resourceVersionInfo)];
                    case 2:
                        fileStreamInfo = _a.sent();
                        ctx.body = fileStreamInfo.fileStream;
                        ctx.attachment(fileStreamInfo.fileName);
                        ctx.set('content-length', fileStreamInfo.fileSize.toString());
                        ctx.set('content-type', fileStreamInfo.contentType);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.internalClientDownload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, versionId, resourceVersionInfo, fileStreamInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        versionId = ctx.checkParams('versionId').isMd5().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.findOne({ versionId: versionId }, 'userId fileSha1 filename resourceName version systemProperty')];
                    case 1:
                        resourceVersionInfo = _a.sent();
                        ctx.entityNullObjectCheck(resourceVersionInfo, { msg: ctx.gettext('params-validate-failed', 'versionId') });
                        return [4 /*yield*/, this.resourceVersionService.getResourceFileStream(resourceVersionInfo)];
                    case 2:
                        fileStreamInfo = _a.sent();
                        ctx.body = fileStreamInfo.fileStream;
                        ctx.attachment(fileStreamInfo.fileName);
                        ctx.set('content-length', fileStreamInfo.fileSize.toString());
                        // 此代码需要放到ctx.attachment后面.否则就是midway自动根据附件后缀名给你设置mime了.程序变的无法控制
                        ctx.set('content-type', fileStreamInfo.contentType);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.fileIsCanBeCreate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, fileSha1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        fileSha1 = ctx.checkQuery('fileSha1').exist().isSha1().toLowercase().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.checkFileIsCanBeCreate(fileSha1).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.batchSignAndSetContractToVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, subjects, subjectValidateResult, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        subjects = ctx.checkBody('subjects').exist().isArray().value;
                        ctx.validateParams();
                        subjectValidateResult = this.batchSignSubjectValidator.validate(subjects);
                        if (!(0, lodash_1.isEmpty)(subjectValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'policies'), {
                                errors: subjectValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
                        return [4 /*yield*/, this.resourceVersionService.batchSetPolicyToVersions(resourceInfo, subjects).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceVersionController.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, version, resolveResources, description, customPropertyDescriptors, resolveResourceValidateResult, customPropertyDescriptorValidateResult, resourceVersion, options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        version = ctx.checkParams('version').exist().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        resolveResources = ctx.checkBody('resolveResources').optional().isArray().value;
                        description = ctx.checkBody('description').optional().type('string').value;
                        customPropertyDescriptors = ctx.checkBody('customPropertyDescriptors').optional().isArray().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resolveDependencyOrUpcastValidator.validate(resolveResources)];
                    case 1:
                        resolveResourceValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(resolveResources) && !(0, lodash_1.isEmpty)(resolveResourceValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resolveResources'), {
                                errors: resolveResourceValidateResult.errors
                            });
                        }
                        return [4 /*yield*/, this.customPropertyValidator.validate(customPropertyDescriptors)];
                    case 2:
                        customPropertyDescriptorValidateResult = _a.sent();
                        if (!(0, lodash_1.isEmpty)(customPropertyDescriptors) && !(0, lodash_1.isEmpty)(customPropertyDescriptorValidateResult.errors)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'customPropertyDescriptors'), {
                                errors: customPropertyDescriptorValidateResult.errors
                            });
                        }
                        if (customPropertyDescriptors === null || customPropertyDescriptors === void 0 ? void 0 : customPropertyDescriptors.some(function (x) { return x.type !== 'editableText' && x.defaultValue.length < 1; })) {
                            throw new egg_freelog_base_1.ArgumentError('自定义属性格式校验失败,请确保defaultValue有效');
                        }
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version)];
                    case 3:
                        resourceVersion = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceVersion, { msg: ctx.gettext('params-validate-failed', 'resourceId,version') });
                        options = {
                            description: description,
                            resolveResources: resolveResources,
                            customPropertyDescriptors: customPropertyDescriptors
                        };
                        return [4 /*yield*/, this.resourceVersionService.updateResourceVersion(resourceVersion, options).then(ctx.success)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "outsideApiService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "customPropertyValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resourceUpcastValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resourceVersionService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resolveDependencyOrUpcastValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resourceVersionDependencyValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "batchSignSubjectValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionController.prototype, "resourcePropertyGenerator");
    __decorate([
        (0, midway_1.get)('/:resourceId/versions'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceVersionController.prototype, "index");
    __decorate([
        (0, midway_1.get)('/versions/detail')
    ], ResourceVersionController.prototype, "detail");
    __decorate([
        (0, midway_1.get)('/versions/list')
    ], ResourceVersionController.prototype, "list");
    __decorate([
        (0, midway_1.get)('/:resourceId/versions/drafts'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "resourceVersionDraft");
    __decorate([
        (0, midway_1.post)('/:resourceId/versions'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "create");
    __decorate([
        (0, midway_1.get)('/files/:fileSha1/versions'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "versionsBySha1");
    __decorate([
        (0, midway_1.get)('/:resourceId/versions/:version/property'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceVersionController.prototype, "versionProperty");
    __decorate([
        (0, midway_1.post)('/:resourceId/versions/drafts'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "createOrUpdateResourceVersionDraft");
    __decorate([
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
        (0, midway_1.post)('/:resourceId/versions/cycleDependencyCheck')
    ], ResourceVersionController.prototype, "validateResourceVersionDependencies");
    __decorate([
        (0, midway_1.get)('/:resourceId/versions/:version'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceVersionController.prototype, "show");
    __decorate([
        (0, midway_1.get)('/:resourceId/versions/:version/download'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceVersionController.prototype, "download");
    __decorate([
        (0, midway_1.get)('/versions/:versionId/internalClientDownload'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient) // IdentityTypeEnum.InternalClient
    ], ResourceVersionController.prototype, "internalClientDownload");
    __decorate([
        (0, midway_1.get)('/versions/isCanBeCreate'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "fileIsCanBeCreate");
    __decorate([
        (0, midway_1.put)('/:resourceId/versions/batchSetContracts')
    ], ResourceVersionController.prototype, "batchSignAndSetContractToVersion");
    __decorate([
        (0, midway_1.put)('/:resourceId/versions/:version'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceVersionController.prototype, "update");
    ResourceVersionController = __decorate([
        (0, midway_1.provide)(),
        (0, midway_1.priority)(1),
        (0, midway_1.controller)('/v2/resources')
    ], ResourceVersionController);
    return ResourceVersionController;
}());
exports.ResourceVersionController = ResourceVersionController;
