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
exports.ResourceAuthController = void 0;
var semver = require("semver");
var lodash_1 = require("lodash");
var midway_1 = require("midway");
var auth_interface_1 = require("../../auth-interface");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceAuthController = /** @class */ (function () {
    function ResourceAuthController() {
    }
    /**
     * 展品服务的色块
     */
    ResourceAuthController.prototype.serviceStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ctx.success([
                    { name: 'active', type: 'authorization', value: 1 },
                    { name: 'testActive', type: 'testAuthorization', value: 2 }
                ]);
                return [2 /*return*/];
            });
        });
    };
    ResourceAuthController.prototype.resourceVersionBatchAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceVersionIds, authType, resourceVersions, validVersionIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceVersionIds = ctx.checkQuery('resourceVersionIds').exist().isSplitMd5().toSplitArray().len(1, 500).value;
                        authType = ctx.checkQuery('authType').optional()["in"](['testAuth', 'auth'])["default"]('auth').value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.find({ versionId: { $in: resourceVersionIds } }, 'resourceId resourceName version versionId resolveResources')];
                    case 1:
                        resourceVersions = _a.sent();
                        validVersionIds = (0, lodash_1.differenceWith)(resourceVersionIds, resourceVersions, function (x, y) { return x === y.versionId; });
                        if (!(0, lodash_1.isEmpty)(validVersionIds)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'resourceVersionIds'), { validVersionIds: validVersionIds });
                        }
                        return [4 /*yield*/, this.resourceAuthService.resourceBatchAuth(resourceVersions, authType).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceAuthController.prototype.resourceAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, licenseeId, isIncludeUpstreamAuth, version, resourceInfo, authResult, contracts, downstreamAuthResult, resourceVersionInfo, authResult, upstreamAuthResult, fileStreamInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('subjectId').isResourceId().value;
                        licenseeId = ctx.checkQuery('licenseeId').optional().value;
                        isIncludeUpstreamAuth = ctx.checkQuery('isIncludeUpstreamAuth').optional().toInt()["in"]([0, 1])["default"](1).value;
                        version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId, 'latestVersion')];
                    case 1:
                        resourceInfo = _a.sent();
                        if (!resourceInfo) {
                            authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        return [4 /*yield*/, this.outsideApiService.getResourceContracts(resourceId, licenseeId, {
                                status: egg_freelog_base_1.ContractStatusEnum.Executed,
                                projection: 'authStatus'
                            })];
                    case 2:
                        contracts = _a.sent();
                        return [4 /*yield*/, this.resourceAuthService.contractAuth(resourceId, contracts, 'auth')];
                    case 3:
                        downstreamAuthResult = _a.sent();
                        if (!downstreamAuthResult.isAuth) {
                            return [2 /*return*/, ctx.success(downstreamAuthResult)];
                        }
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version !== null && version !== void 0 ? version : resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty')];
                    case 4:
                        resourceVersionInfo = _a.sent();
                        if (!resourceVersionInfo) {
                            authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError)
                                .setData({ resourceId: resourceId, version: version })
                                .setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        return [4 /*yield*/, this.resourceAuthService.resourceAuth(resourceVersionInfo, isIncludeUpstreamAuth)];
                    case 5:
                        upstreamAuthResult = _a.sent();
                        if (!upstreamAuthResult.isAuth) {
                            return [2 /*return*/, ctx.success(upstreamAuthResult)];
                        }
                        return [4 /*yield*/, this.resourceVersionService.getResourceFileStream(resourceVersionInfo)];
                    case 6:
                        fileStreamInfo = _a.sent();
                        ctx.body = fileStreamInfo.fileStream;
                        ctx.set('content-length', fileStreamInfo.fileSize.toString());
                        ctx.attachment(fileStreamInfo.fileName);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceAuthController.prototype.resourceUpstreamAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, version, resourceInfo, authResult, resourceVersionInfo, authResult, resourceAuthTree, upstreamAuthResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('subjectId').isResourceId().value;
                        version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId, 'latestVersion')];
                    case 1:
                        resourceInfo = _a.sent();
                        if (!resourceInfo) {
                            authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version !== null && version !== void 0 ? version : resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty')];
                    case 2:
                        resourceVersionInfo = _a.sent();
                        if (!resourceVersionInfo) {
                            authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError)
                                .setData({ resourceId: resourceId, version: version })
                                .setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        return [4 /*yield*/, this.resourceService.getResourceAuthTree(resourceVersionInfo)];
                    case 3:
                        resourceAuthTree = _a.sent();
                        return [4 /*yield*/, this.resourceAuthService.resourceUpstreamAuth(resourceAuthTree)];
                    case 4:
                        upstreamAuthResult = _a.sent();
                        ctx.success(upstreamAuthResult);
                        return [2 /*return*/];
                }
            });
        });
    };
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供.后续如果考虑实现身份授权链的验证,则可以开放外部调用
    ResourceAuthController.prototype.subjectContractAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, contractIds, version, authResult, getResourceInfoTask, getContractsTask, _a, resourceInfo, contracts, notFoundContractIds, downstreamContractAuthResult, resourceVersionInfo, fileStreamInfo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('subjectId').isResourceId().value;
                        contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
                        version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        ctx.validateParams();
                        authResult = new auth_interface_1.SubjectAuthResult();
                        getResourceInfoTask = this.resourceService.findByResourceId(resourceId, 'latestVersion');
                        getContractsTask = this.outsideApiService.getContractByContractIds(contractIds, {
                            projection: 'authStatus,subjectType,subjectId'
                        });
                        return [4 /*yield*/, Promise.all([getResourceInfoTask, getContractsTask])];
                    case 1:
                        _a = _b.sent(), resourceInfo = _a[0], contracts = _a[1];
                        if (!resourceInfo) {
                            authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subjectId'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        notFoundContractIds = (0, lodash_1.differenceWith)(contractIds, contracts, function (x, y) { return x === y.contractId; });
                        if (!(0, lodash_1.isEmpty)(notFoundContractIds)) {
                            authResult.setData({ notFoundContractIds: notFoundContractIds }).setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound).setErrorMsg('未找到指定的合约');
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        downstreamContractAuthResult = this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
                        if (!downstreamContractAuthResult.isAuth || ctx.request.url.includes('/contractAuth/result')) {
                            return [2 /*return*/, ctx.success(downstreamContractAuthResult)];
                        }
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceId, version !== null && version !== void 0 ? version : resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty')];
                    case 2:
                        resourceVersionInfo = _b.sent();
                        if (!resourceVersionInfo) {
                            authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError).setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
                            return [2 /*return*/, ctx.success(authResult)];
                        }
                        return [4 /*yield*/, this.resourceVersionService.getResourceFileStream(resourceVersionInfo)];
                    case 3:
                        fileStreamInfo = _b.sent();
                        ctx.body = fileStreamInfo.fileStream;
                        ctx.set('content-length', fileStreamInfo.fileSize.toString());
                        ctx.attachment(fileStreamInfo.fileName);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceAuthController.prototype.resourceRelationTreeAuthResult = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIdOrName, version, versionRange, resourceInfo, resourceVersion, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIdOrName = ctx.checkParams('subjectId').exist().decodeURIComponent().value;
                        version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
                        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
                        ctx.validateParams();
                        resourceInfo = null;
                        if (!egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceIdOrName)];
                    case 1:
                        resourceInfo = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resourceService.findOneByResourceName(resourceIdOrName)];
                    case 3:
                        resourceInfo = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
                    case 5:
                        ctx.entityNullObjectCheck(resourceInfo, {
                            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
                            data: { resourceIdOrName: resourceIdOrName }
                        });
                        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
                            return [2 /*return*/, ctx.success([])];
                        }
                        resourceVersion = resourceInfo.latestVersion;
                        if ((0, lodash_1.isString)(version)) {
                            resourceVersion = version;
                        }
                        else if ((0, lodash_1.isString)(versionRange)) {
                            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(function (x) { return x.version; }), versionRange);
                        }
                        if (!resourceVersion) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
                        }
                        return [4 /*yield*/, this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion)];
                    case 6:
                        versionInfo = _a.sent();
                        ctx.entityNullObjectCheck(versionInfo, {
                            msg: ctx.gettext('params-validate-failed', 'version'),
                            data: { version: version }
                        });
                        return [4 /*yield*/, this.resourceAuthService.resourceRelationTreeAuth(resourceInfo, versionInfo).then(ctx.success)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthController.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthController.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthController.prototype, "outsideApiService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthController.prototype, "resourceAuthService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthController.prototype, "resourceVersionService");
    __decorate([
        (0, midway_1.get)('/serviceStates')
    ], ResourceAuthController.prototype, "serviceStates");
    __decorate([
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
        (0, midway_1.get)('/batchAuth/result')
    ], ResourceAuthController.prototype, "resourceVersionBatchAuth");
    __decorate([
        (0, midway_1.get)('/:subjectId/result')
    ], ResourceAuthController.prototype, "resourceAuth");
    __decorate([
        (0, midway_1.get)('/:subjectId/upstreamAuth/result'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceAuthController.prototype, "resourceUpstreamAuth");
    __decorate([
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
        (0, midway_1.get)('/:subjectId/contractAuth/(fileStream|result)')
    ], ResourceAuthController.prototype, "subjectContractAuth");
    __decorate([
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
        (0, midway_1.get)('/:subjectId/relationTreeAuth')
    ], ResourceAuthController.prototype, "resourceRelationTreeAuthResult");
    ResourceAuthController = __decorate([
        (0, midway_1.provide)(),
        (0, midway_1.controller)('/v2/auths/resources') // 统一URL v2/auths/:subjectType
    ], ResourceAuthController);
    return ResourceAuthController;
}());
exports.ResourceAuthController = ResourceAuthController;
