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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ResourceVersionService = void 0;
var midway_1 = require("midway");
var semver = require("semver");
var egg_freelog_base_1 = require("egg-freelog-base");
var lodash_1 = require("lodash");
var ResourceVersionService = /** @class */ (function () {
    function ResourceVersionService() {
    }
    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    ResourceVersionService.prototype.createResourceVersion = function (resourceInfo, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dependencies, isFirstVersion, _b, resolveResources, upcastResources, model, beSignSubjects, resourceVersion;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._validateDependencies(resourceInfo.resourceId, options.dependencies, options === null || options === void 0 ? void 0 : options.resolveResources.map(function (x) { return x.resourceId; }))];
                    case 1:
                        dependencies = _c.sent();
                        isFirstVersion = (0, lodash_1.isEmpty)(resourceInfo.resourceVersions);
                        return [4 /*yield*/, this._validateUpcastAndResolveResource(dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion)];
                    case 2:
                        _b = _c.sent(), resolveResources = _b.resolveResources, upcastResources = _b.upcastResources;
                        model = {
                            version: options.version,
                            resourceId: resourceInfo.resourceId,
                            resourceName: resourceInfo.resourceName,
                            userId: resourceInfo.userId,
                            resourceType: resourceInfo.resourceType,
                            fileSha1: options.fileSha1,
                            filename: options.filename,
                            dependencies: options.dependencies,
                            description: options.description,
                            resolveResources: resolveResources,
                            upcastResources: upcastResources,
                            systemProperty: options.systemProperty,
                            customPropertyDescriptors: options.customPropertyDescriptors,
                            versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, options.version)
                        };
                        if ((0, lodash_1.isArray)(options.customPropertyDescriptors)) {
                            this._checkCustomPropertyDescriptors((_a = options.systemProperty) !== null && _a !== void 0 ? _a : {}, options.customPropertyDescriptors);
                        }
                        if (!!(0, lodash_1.isEmpty)(resolveResources)) return [3 /*break*/, 4];
                        beSignSubjects = (0, lodash_1.chain)(resolveResources).map(function (_a) {
                            var resourceId = _a.resourceId, contracts = _a.contracts;
                            return contracts.map(function (_a) {
                                var policyId = _a.policyId;
                                return Object({
                                    subjectId: resourceId,
                                    policyId: policyId
                                });
                            });
                        }).flattenDeep().value();
                        return [4 /*yield*/, this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, beSignSubjects).then(function (contracts) {
                                var contractMap = new Map(contracts.map(function (x) { return [x.subjectId + x.policyId, x.contractId]; }));
                                model.resolveResources.forEach(function (resolveResource) { return resolveResource.contracts.forEach(function (resolveContractInfo) {
                                    var _a;
                                    resolveContractInfo.contractId = (_a = contractMap.get(resolveResource.resourceId + resolveContractInfo.policyId)) !== null && _a !== void 0 ? _a : '';
                                }); });
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this.resourceVersionProvider.create(model)];
                    case 5:
                        resourceVersion = _c.sent();
                        this.resourceVersionDraftProvider.deleteOne({ resourceId: resourceInfo.resourceId }).then();
                        return [4 /*yield*/, this.resourceService.createdResourceVersionHandle(resourceInfo, resourceVersion)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, resourceVersion];
                }
            });
        });
    };
    /**
     * 更新资源版本
     * @param versionInfo
     * @param options
     */
    ResourceVersionService.prototype.updateResourceVersion = function (versionInfo, options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, invalidResolveResources, beSignSubjects, contractMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model = {};
                        if (!(0, lodash_1.isUndefined)(options.description)) {
                            model.description = options.description;
                        }
                        if ((0, lodash_1.isArray)(options.customPropertyDescriptors)) {
                            this._checkCustomPropertyDescriptors(versionInfo.systemProperty, options.customPropertyDescriptors);
                            model.customPropertyDescriptors = options.customPropertyDescriptors;
                        }
                        // 更新合约代码较复杂,如果本次更新不牵扯到合约内容,则提前返回
                        if ((0, lodash_1.isUndefined)(options.resolveResources) || (0, lodash_1.isEmpty)(options.resolveResources)) {
                            return [2 /*return*/, this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { "new": true })];
                        }
                        invalidResolveResources = (0, lodash_1.differenceBy)(options.resolveResources, versionInfo.resolveResources, 'resourceId');
                        if (!(0, lodash_1.isEmpty)(invalidResolveResources)) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), { invalidResolveResources: invalidResolveResources });
                        }
                        beSignSubjects = (0, lodash_1.chain)(options.resolveResources).map(function (_a) {
                            var resourceId = _a.resourceId, contracts = _a.contracts;
                            return contracts.map(function (_a) {
                                var policyId = _a.policyId;
                                return Object({
                                    subjectId: resourceId,
                                    policyId: policyId
                                });
                            });
                        }).flattenDeep().value();
                        return [4 /*yield*/, this.outsideApiService.batchSignResourceContracts(versionInfo.resourceId, beSignSubjects).then(function (contracts) {
                                return new Map(contracts.map(function (x) { return [x.subjectId + x.policyId, x.contractId]; }));
                            })];
                    case 1:
                        contractMap = _a.sent();
                        options.resolveResources.forEach(function (resolveResource) { return resolveResource.contracts.forEach(function (item) {
                            var _a;
                            item.contractId = (_a = contractMap.get(resolveResource.resourceId + item.policyId)) !== null && _a !== void 0 ? _a : '';
                        }); });
                        model.resolveResources = versionInfo.resolveResources.map(function (resolveResource) {
                            var modifyResolveResource = options.resolveResources.find(function (x) { return x.resourceId === resolveResource.resourceId; });
                            return modifyResolveResource ? (0, lodash_1.assign)(resolveResource, modifyResolveResource) : resolveResource;
                        });
                        return [2 /*return*/, this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { "new": true })];
                }
            });
        });
    };
    /**
     * 保存资源草稿
     * @param resourceInfo
     * @param draftData
     */
    ResourceVersionService.prototype.saveOrUpdateResourceVersionDraft = function (resourceInfo, draftData) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            var _this = this;
            return __generator(this, function (_a) {
                model = {
                    resourceId: resourceInfo.resourceId,
                    userId: resourceInfo.userId,
                    resourceType: resourceInfo.resourceType,
                    draftData: draftData !== null && draftData !== void 0 ? draftData : {}
                };
                return [2 /*return*/, this.resourceVersionDraftProvider.findOneAndUpdate({ resourceId: resourceInfo.resourceId }, model, { "new": true }).then(function (data) {
                        return data !== null && data !== void 0 ? data : _this.resourceVersionDraftProvider.create(model);
                    })];
            });
        });
    };
    /**
     * 获取资源版本草稿
     * @param {string} resourceId
     * @returns {Promise<any>}
     */
    ResourceVersionService.prototype.getResourceVersionDraft = function (resourceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceVersionDraftProvider.findOne({ resourceId: resourceId })];
            });
        });
    };
    /**
     * 获取资源文件流
     * @param versionInfo
     */
    ResourceVersionService.prototype.getResourceFileStream = function (versionInfo) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var stream, extName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.outsideApiService.getFileStream(versionInfo.fileSha1)];
                    case 1:
                        stream = _c.sent();
                        if (!stream.res.statusCode.toString().startsWith('2')) {
                            this.ctx.status = stream.res.statusCode;
                            this.ctx.body = stream.data.toString();
                            throw new egg_freelog_base_1.BreakOffError();
                        }
                        extName = '';
                        if ((0, lodash_1.isString)(versionInfo.filename)) {
                            extName = versionInfo.filename.substr(versionInfo.filename.lastIndexOf('.'));
                        }
                        return [2 /*return*/, {
                                fileSha1: versionInfo.fileSha1,
                                contentType: (_b = (_a = versionInfo.systemProperty) === null || _a === void 0 ? void 0 : _a.mime) !== null && _b !== void 0 ? _b : this.resourcePropertyGenerator.getResourceMimeType(versionInfo.filename),
                                fileName: versionInfo.resourceName + "_" + versionInfo.version + extName,
                                fileSize: versionInfo.systemProperty.fileSize,
                                fileStream: stream.data
                            }];
                }
            });
        });
    };
    /**
     * 检查文件是否可以被创建成资源的版本
     * @param fileSha1
     */
    ResourceVersionService.prototype.checkFileIsCanBeCreate = function (fileSha1) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceVersionProvider.findOne({
                        fileSha1: fileSha1,
                        userId: { $ne: this.ctx.userId }
                    }, '_id').then(function (x) { return !Boolean(x); })];
            });
        });
    };
    ResourceVersionService.prototype.find = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceVersionProvider).find.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    ResourceVersionService.prototype.findOne = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceVersionProvider).findOne.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    ResourceVersionService.prototype.findOneByVersion = function (resourceId, version) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var versionId;
            return __generator(this, function (_a) {
                versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
                return [2 /*return*/, this.findOne.apply(this, __spreadArray([{ versionId: versionId }], args, false))];
            });
        });
    };
    /**
     * 批量签约并且应用到版本中
     * @param resourceInfo
     * @param subjects
     */
    ResourceVersionService.prototype.batchSetPolicyToVersions = function (resourceInfo, subjects) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var toBeModifyVersions, toBeSignSubjects, versionModifyPolicyMap, invalidVersions, invalidSubjects, versionIds, resourceVersionMap, _loop_1, _i, versionModifyPolicyMap_1, _c, version, subjectInfos, contractMap, tasks, cancelFailedPolicies, _loop_2, this_1, _d, versionModifyPolicyMap_2, _e, version, subjectInfos;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        toBeModifyVersions = [];
                        toBeSignSubjects = [];
                        versionModifyPolicyMap = new Map();
                        subjects.forEach(function (subject) { return subject.versions.forEach(function (_a) {
                            var version = _a.version, policyId = _a.policyId, operation = _a.operation;
                            if (!versionModifyPolicyMap.has(version)) {
                                toBeModifyVersions.push(version);
                                versionModifyPolicyMap.set(version, []);
                            }
                            versionModifyPolicyMap.get(version).push({ subjectId: subject.subjectId, policyId: policyId, operation: operation });
                        }); });
                        invalidVersions = (0, lodash_1.differenceWith)(toBeModifyVersions, resourceInfo.resourceVersions, function (x, y) { return x === y.version; });
                        if (!(0, lodash_1.isEmpty)(invalidVersions)) {
                            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), { invalidVersions: invalidVersions });
                        }
                        invalidSubjects = [];
                        versionIds = (0, lodash_1.intersectionWith)(resourceInfo.resourceVersions, toBeModifyVersions, function (x, y) { return x.version === y; }).map(function (x) { return x.versionId; });
                        return [4 /*yield*/, this.find({ versionId: { $in: versionIds } }, 'version versionId resolveResources').then(function (list) { return new Map(list.map(function (x) { return [x.version, x]; })); })];
                    case 1:
                        resourceVersionMap = _f.sent();
                        _loop_1 = function (version, subjectInfos) {
                            var resolveResources = (_b = (_a = resourceVersionMap.get(version)) === null || _a === void 0 ? void 0 : _a.resolveResources) !== null && _b !== void 0 ? _b : [];
                            subjectInfos.forEach(function (_a) {
                                var subjectId = _a.subjectId, policyId = _a.policyId, operation = _a.operation;
                                if (operation === 1 && !toBeSignSubjects.some(function (x) { return x.subjectId == subjectId && x.policyId === policyId; })) {
                                    toBeSignSubjects.push({ subjectId: subjectId, policyId: policyId });
                                }
                                if (!resolveResources.some(function (x) { return x.resourceId === subjectId; })) {
                                    invalidSubjects.push({ subjectId: subjectId, policyId: policyId, version: version });
                                }
                            });
                        };
                        for (_i = 0, versionModifyPolicyMap_1 = versionModifyPolicyMap; _i < versionModifyPolicyMap_1.length; _i++) {
                            _c = versionModifyPolicyMap_1[_i], version = _c[0], subjectInfos = _c[1];
                            _loop_1(version, subjectInfos);
                        }
                        if (!(0, lodash_1.isEmpty)(invalidSubjects)) {
                            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), { invalidSubjects: invalidSubjects });
                        }
                        return [4 /*yield*/, this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, toBeSignSubjects).then(function (list) {
                                return new Map(list.map(function (x) { return [x.subjectId + x.policyId, x.contractId]; }));
                            })];
                    case 2:
                        contractMap = _f.sent();
                        tasks = [], cancelFailedPolicies = [];
                        _loop_2 = function (version, subjectInfos) {
                            var resourceVersionInfo = resourceVersionMap.get(version);
                            resourceVersionInfo.resolveResources.forEach(function (resolveResource) {
                                var modifySubjects = subjectInfos.filter(function (x) { return x.subjectId === resolveResource.resourceId; });
                                if ((0, lodash_1.isEmpty)(modifySubjects)) {
                                    return;
                                }
                                modifySubjects.forEach(function (_a) {
                                    var _b;
                                    var subjectId = _a.subjectId, policyId = _a.policyId, operation = _a.operation;
                                    if (operation === 0) {
                                        resolveResource.contracts = resolveResource.contracts.filter(function (x) { return x.policyId !== policyId; });
                                        return;
                                    }
                                    var contractId = (_b = contractMap.get(subjectId + policyId)) !== null && _b !== void 0 ? _b : '';
                                    var modifyContract = resolveResource.contracts.find(function (x) { return x.policyId === policyId; });
                                    if (modifyContract) {
                                        modifyContract.contractId = contractId;
                                    }
                                    else {
                                        resolveResource.contracts.push({ policyId: policyId, contractId: contractId });
                                    }
                                });
                            });
                            if (resourceVersionInfo.resolveResources.some(function (x) { return (0, lodash_1.isEmpty)(x.contracts); })) {
                                cancelFailedPolicies.push({
                                    version: version,
                                    subjectInfos: subjectInfos.filter(function (x) { return x.operation === 0; })
                                });
                            }
                            else {
                                tasks.push(this_1.resourceVersionProvider.updateOne({
                                    versionId: resourceVersionInfo.versionId
                                }, { resolveResources: resourceVersionInfo.resolveResources }));
                            }
                        };
                        this_1 = this;
                        for (_d = 0, versionModifyPolicyMap_2 = versionModifyPolicyMap; _d < versionModifyPolicyMap_2.length; _d++) {
                            _e = versionModifyPolicyMap_2[_d], version = _e[0], subjectInfos = _e[1];
                            _loop_2(version, subjectInfos);
                        }
                        return [2 /*return*/, Promise.all(tasks).then(function (list) { return Boolean(list.length && list.every(function (x) { return x.ok; })); })];
                }
            });
        });
    };
    /**
     * 循坏依赖检查
     * @param resourceId
     * @param dependencies
     * @param deep
     */
    ResourceVersionService.prototype.cycleDependCheck = function (resourceId, dependencies, deep) {
        return __awaiter(this, void 0, void 0, function () {
            var dependVersionIdSet, dependResourceInfos, dependVersionInfos, dependSubResources;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (deep > 20) {
                            throw new egg_freelog_base_1.ApplicationError('资源嵌套层级超过系统限制');
                        }
                        if ((0, lodash_1.isEmpty)(dependencies)) {
                            return [2 /*return*/, { ret: false }];
                        }
                        if (dependencies.some(function (x) { return x.resourceId === resourceId; })) {
                            return [2 /*return*/, { ret: true, deep: deep }];
                        }
                        dependVersionIdSet = new Set();
                        return [4 /*yield*/, this.resourceService.find({ _id: { $in: dependencies.map(function (x) { return x.resourceId; }) } }, 'resourceVersions')];
                    case 1:
                        dependResourceInfos = _a.sent();
                        dependResourceInfos.forEach(function (resourceInfo) { return resourceInfo.resourceVersions.forEach(function (_a) {
                            var version = _a.version;
                            dependVersionIdSet.add(_this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version));
                        }); });
                        if (!dependVersionIdSet.size) {
                            return [2 /*return*/, { ret: false }];
                        }
                        return [4 /*yield*/, this.resourceVersionProvider.find({ versionId: { $in: __spreadArray([], dependVersionIdSet.values(), true) } }, 'dependencies')];
                    case 2:
                        dependVersionInfos = _a.sent();
                        dependSubResources = (0, lodash_1.chain)(dependVersionInfos).map(function (m) { return m.dependencies; }).flattenDeep().value();
                        return [2 /*return*/, this.cycleDependCheck(resourceId, dependSubResources, deep + 1)];
                }
            });
        });
    };
    /**
     * 综合计算获得版本的最终属性
     * @param resourceVersionInfo
     * @returns {Promise<void>}
     */
    ResourceVersionService.prototype.calculateResourceVersionProperty = function (resourceVersionInfo) {
        var resourceCustomReadonlyInfo = {};
        var resourceCustomEditableInfo = {};
        var customPropertyDescriptors = resourceVersionInfo.customPropertyDescriptors;
        customPropertyDescriptors === null || customPropertyDescriptors === void 0 ? void 0 : customPropertyDescriptors.forEach(function (_a) {
            var key = _a.key, defaultValue = _a.defaultValue, type = _a.type;
            if (type === 'readonlyText') {
                resourceCustomReadonlyInfo[key] = defaultValue;
            }
            else {
                resourceCustomEditableInfo[key] = defaultValue;
            }
        });
        // 属性优先级为: 1.系统属性 2:资源定义的不可编辑的属性 3:资源自定义的可编辑属性
        return (0, lodash_1.assign)(resourceCustomEditableInfo, resourceCustomReadonlyInfo, resourceVersionInfo.systemProperty);
    };
    /**
     * * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param resourceId
     * @param dependencies
     * @param resolveResourceIds
     */
    ResourceVersionService.prototype._validateDependencies = function (resourceId, dependencies, resolveResourceIds) {
        return __awaiter(this, void 0, void 0, function () {
            var cycleDependCheckResult, dependResourceMap, invalidDependencies, invalidResourceVersionRanges;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ((0, lodash_1.isEmpty)(dependencies)) {
                            return [2 /*return*/, dependencies];
                        }
                        if (dependencies.length !== (0, lodash_1.uniqBy)(dependencies, 'resourceId').length) {
                            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), { dependencies: dependencies });
                        }
                        return [4 /*yield*/, this.cycleDependCheck(resourceId, dependencies || [], 1)];
                    case 1:
                        cycleDependCheckResult = _a.sent();
                        if (cycleDependCheckResult.ret) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-circular-dependency-error'), {
                                resourceId: resourceId,
                                deep: cycleDependCheckResult.deep
                            });
                        }
                        return [4 /*yield*/, this.resourceService.find({ _id: { $in: dependencies.map(function (x) { return x.resourceId; }) } })
                                .then(function (list) { return new Map(list.map(function (x) { return [x.resourceId, x]; })); })];
                    case 2:
                        dependResourceMap = _a.sent();
                        invalidDependencies = [];
                        invalidResourceVersionRanges = [];
                        dependencies.forEach(function (dependency) {
                            var resourceInfo = dependResourceMap.get(dependency.resourceId);
                            if (!resourceInfo || (resourceInfo.status !== 1 && !resolveResourceIds.includes(resourceInfo.resourceId))) {
                                invalidDependencies.push(dependency);
                                return;
                            }
                            if (!resourceInfo.resourceVersions.some(function (x) { return semver.satisfies(x['version'], dependency.versionRange); })) {
                                invalidResourceVersionRanges.push(dependency);
                            }
                            dependency.resourceName = resourceInfo.resourceName;
                            dependency.baseUpcastResources = resourceInfo.baseUpcastResources;
                            dependency.resourceVersions = resourceInfo.resourceVersions;
                        });
                        if (invalidDependencies.length) {
                            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), { invalidDependencies: invalidDependencies });
                        }
                        if (invalidResourceVersionRanges.length) {
                            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-versionRange-invalid'), { invalidResourceVersionRanges: invalidResourceVersionRanges });
                        }
                        return [2 /*return*/, dependencies];
                }
            });
        });
    };
    /**
     * 验证上抛和需要解决的资源
     * @param dependencies
     * @param resolveResources
     * @param baseUpcastResources
     * @param isCheckBaseUpcast
     */
    ResourceVersionService.prototype._validateUpcastAndResolveResource = function (dependencies, resolveResources, baseUpcastResources, isCheckBaseUpcast) {
        if (isCheckBaseUpcast === void 0) { isCheckBaseUpcast = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, upcastResources, backlogResources, allUntreatedResources, invalidBaseUpcastResources, untreatedResources, invalidResolveResources, resourceMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources)];
                    case 1:
                        _a = _b.sent(), upcastResources = _a.upcastResources, backlogResources = _a.backlogResources, allUntreatedResources = _a.allUntreatedResources;
                        // 第一个发行方案需要检查基础上抛是否在范围内
                        if (isCheckBaseUpcast) {
                            invalidBaseUpcastResources = (0, lodash_1.differenceBy)(baseUpcastResources, upcastResources, 'resourceId');
                            if (invalidBaseUpcastResources.length) {
                                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-upcast-validate-failed'), { invalidBaseUpcastResources: invalidBaseUpcastResources });
                            }
                        }
                        untreatedResources = (0, lodash_1.differenceBy)(backlogResources, resolveResources, function (x) { return x['resourceId']; });
                        if (untreatedResources.length) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), { untreatedResources: untreatedResources });
                        }
                        invalidResolveResources = (0, lodash_1.differenceBy)(resolveResources, backlogResources, 'resourceId');
                        if (invalidResolveResources.length) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('params-validate-failed', 'resolveResources'), { invalidResolveResources: invalidResolveResources });
                        }
                        resourceMap = new Map(allUntreatedResources.map(function (x) { return [x['resourceId'], x['resourceName']]; }));
                        resolveResources.forEach(function (item) { return item.resourceName = resourceMap.get(item.resourceId); });
                        return [2 /*return*/, { resolveResources: resolveResources, upcastResources: upcastResources }];
                }
            });
        });
    };
    /**
     * 通过依赖和基础上抛,推断出当前版本实际需要解决的资源,实际上抛的资源.
     * allUntreatedResources: 当前版本的依赖资源以及依赖的上抛资源集合
     * backlogResources: 所有需要待处理的资源(必须要当前版本解决的)
     * upcastResources: 当前版本真实的上抛资源(基础上抛的子集)
     * @param dependencies
     * @param baseUpcastResources
     * @returns {Promise<{upcastResources: object[]; backlogResources: object[]; allUntreatedResources: object[]}>}
     * @private
     */
    ResourceVersionService.prototype._getRealUpcastAndResolveResources = function (dependencies, baseUpcastResources) {
        return __awaiter(this, void 0, void 0, function () {
            var upcastResources, backlogResources, allUntreatedResources;
            return __generator(this, function (_a) {
                upcastResources = [];
                backlogResources = [];
                allUntreatedResources = [];
                if (!dependencies.length) {
                    return [2 /*return*/, { upcastResources: upcastResources, backlogResources: backlogResources, allUntreatedResources: allUntreatedResources }];
                }
                allUntreatedResources = (0, lodash_1.chain)(dependencies).map(function (x) { return x.baseUpcastResources; })
                    .flattenDeep().concat(dependencies).uniqBy('resourceId').map(function (x) { return (0, lodash_1.pick)(x, ['resourceId', 'resourceName']); }).value();
                // 真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
                backlogResources = (0, lodash_1.differenceBy)(allUntreatedResources, baseUpcastResources, function (x) { return x['resourceId']; });
                upcastResources = (0, lodash_1.differenceBy)(allUntreatedResources, backlogResources, function (x) { return x['resourceId']; });
                return [2 /*return*/, { allUntreatedResources: allUntreatedResources, backlogResources: backlogResources, upcastResources: upcastResources }];
            });
        });
    };
    /**
     * 校验自定义属性描述器
     * @param systemProperty
     * @param customPropertyDescriptors
     * @private
     */
    ResourceVersionService.prototype._checkCustomPropertyDescriptors = function (systemProperty, customPropertyDescriptors) {
        var systemPropertyKeys = Object.keys(systemProperty !== null && systemProperty !== void 0 ? systemProperty : {});
        var customPropertyKeys = customPropertyDescriptors === null || customPropertyDescriptors === void 0 ? void 0 : customPropertyDescriptors.map(function (x) { return x.key; });
        var repetitiveKeys = (0, lodash_1.intersection)(systemPropertyKeys, customPropertyKeys);
        if (!(0, lodash_1.isEmpty)(repetitiveKeys)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('params-validate-failed', 'customPropertyDescriptors'), { repetitiveKeys: repetitiveKeys });
        }
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "resourceVersionProvider");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "resourcePropertyGenerator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "resourceVersionDraftProvider");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceVersionService.prototype, "outsideApiService");
    ResourceVersionService = __decorate([
        (0, midway_1.provide)('resourceVersionService')
    ], ResourceVersionService);
    return ResourceVersionService;
}());
exports.ResourceVersionService = ResourceVersionService;
