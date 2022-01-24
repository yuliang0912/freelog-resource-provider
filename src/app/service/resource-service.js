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
exports.ResourceService = void 0;
var semver_1 = require("semver");
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var lodash_1 = require("lodash");
var semver = require("semver");
var ResourceService = /** @class */ (function () {
    function ResourceService() {
    }
    ResourceService_1 = ResourceService;
    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    ResourceService.prototype.createResource = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var resourceInfo, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        resourceInfo = {
                            resourceName: options.username + "/" + options.name,
                            resourceType: options.resourceType,
                            userId: options.userId,
                            username: options.username,
                            intro: options.intro,
                            coverImages: options.coverImages,
                            resourceVersions: [],
                            baseUpcastResources: [],
                            tags: options.tags,
                            policies: [],
                            status: 0
                        };
                        if (!((0, lodash_1.isArray)(options.policies) && !(0, lodash_1.isEmpty)(options.policies))) return [3 /*break*/, 2];
                        _a = resourceInfo;
                        return [4 /*yield*/, this._validateAndCreateSubjectPolicies(options.policies)];
                    case 1:
                        _a.policies = _b.sent();
                        _b.label = 2;
                    case 2:
                        resourceInfo.status = ResourceService_1._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
                        resourceInfo.uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceInfo.resourceName);
                        resourceInfo.resourceNameAbbreviation = options.name;
                        return [2 /*return*/, this.resourceProvider.create(resourceInfo)];
                }
            });
        });
    };
    /**
     * 更新资源
     * @param resourceInfo
     * @param options
     */
    ResourceService.prototype.updateResource = function (resourceInfo, options) {
        return __awaiter(this, void 0, void 0, function () {
            var updateInfo, existingPolicyMap, existingPolicyNameSet_1, duplicatePolicyNames, createdPolicyList, _i, createdPolicyList_1, createdPolicy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateInfo = {};
                        if ((0, lodash_1.isArray)(options.coverImages)) {
                            updateInfo.coverImages = options.coverImages;
                        }
                        if (!(0, lodash_1.isUndefined)(options.intro)) {
                            updateInfo.intro = options.intro;
                        }
                        if ((0, lodash_1.isArray)(options.tags)) {
                            updateInfo.tags = options.tags;
                        }
                        existingPolicyMap = new Map(resourceInfo.policies.map(function (x) { return [x.policyId, x]; }));
                        if ((0, lodash_1.isArray)(options.updatePolicies) && !(0, lodash_1.isEmpty)(options.updatePolicies)) {
                            options.updatePolicies.forEach(function (modifyPolicy) {
                                var _a;
                                var existingPolicy = existingPolicyMap.get(modifyPolicy.policyId);
                                if (existingPolicy) {
                                    existingPolicy.status = (_a = modifyPolicy.status) !== null && _a !== void 0 ? _a : existingPolicy.status;
                                }
                                // 如果选的策略无效,直接忽略.不做过多干扰
                                // throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'policyId'), modifyPolicy);
                            });
                        }
                        if (!((0, lodash_1.isArray)(options.addPolicies) && !(0, lodash_1.isEmpty)(options.addPolicies))) return [3 /*break*/, 2];
                        existingPolicyNameSet_1 = new Set(resourceInfo.policies.map(function (x) { return x.policyName; }));
                        duplicatePolicyNames = options.addPolicies.filter(function (x) { return existingPolicyNameSet_1.has(x.policyName); });
                        if (!(0, lodash_1.isEmpty)(duplicatePolicyNames)) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-name-duplicate-failed'), duplicatePolicyNames);
                        }
                        return [4 /*yield*/, this._validateAndCreateSubjectPolicies(options.addPolicies)];
                    case 1:
                        createdPolicyList = _a.sent();
                        for (_i = 0, createdPolicyList_1 = createdPolicyList; _i < createdPolicyList_1.length; _i++) {
                            createdPolicy = createdPolicyList_1[_i];
                            if (existingPolicyMap.has(createdPolicy.policyId)) {
                                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('policy-create-duplicate-error'), createdPolicy);
                            }
                            existingPolicyMap.set(createdPolicy.policyId, createdPolicy);
                        }
                        _a.label = 2;
                    case 2:
                        if ((0, lodash_1.isArray)(options.addPolicies) || (0, lodash_1.isArray)(options.updatePolicies)) {
                            resourceInfo.policies = updateInfo.policies = __spreadArray([], existingPolicyMap.values(), true);
                            updateInfo.status = ResourceService_1._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
                        }
                        return [2 /*return*/, this.resourceProvider.findOneAndUpdate({ _id: options.resourceId }, updateInfo, { "new": true })];
                }
            });
        });
    };
    /**
     * 获取资源依赖树
     * @param resourceInfo
     * @param versionInfo
     * @param options
     */
    ResourceService.prototype.getResourceDependencyTree = function (resourceInfo, versionInfo, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var rootTreeNode;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!options.isContainRootNode) {
                            return [2 /*return*/, this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields)];
                        }
                        _b = {
                            resourceId: versionInfo.resourceId,
                            resourceName: versionInfo.resourceName,
                            version: versionInfo.version,
                            versions: (_a = resourceInfo.resourceVersions) === null || _a === void 0 ? void 0 : _a.map(function (x) { return x['version']; }),
                            resourceType: versionInfo.resourceType,
                            versionRange: versionInfo.version,
                            versionId: versionInfo.versionId,
                            fileSha1: versionInfo.fileSha1,
                            baseUpcastResources: resourceInfo.baseUpcastResources,
                            resolveResources: versionInfo.resolveResources
                        };
                        return [4 /*yield*/, this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields)];
                    case 1:
                        rootTreeNode = (_b.dependencies = _c.sent(),
                            _b);
                        return [2 /*return*/, [(0, lodash_1.omit)(rootTreeNode, options.omitFields)]];
                }
            });
        });
    };
    /**
     * 获取资源授权树
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    ResourceService.prototype.getResourceAuthTree = function (versionInfo) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var options, dependencyTree;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((0, lodash_1.isEmpty)((_a = versionInfo.resolveResources) !== null && _a !== void 0 ? _a : [])) {
                            return [2 /*return*/, []];
                        }
                        options = { maxDeep: 999, omitFields: [], isContainRootNode: true };
                        return [4 /*yield*/, this.getResourceDependencyTree({}, versionInfo, options)];
                    case 1:
                        dependencyTree = _b.sent();
                        return [2 /*return*/, this.getResourceAuthTreeFromDependencyTree(dependencyTree)];
                }
            });
        });
    };
    /**
     * 依赖树转换成授权树
     * @param dependencyTree
     */
    ResourceService.prototype.getResourceAuthTreeFromDependencyTree = function (dependencyTree) {
        var _this = this;
        var recursionAuthTree = function (dependencyTreeNode) { return dependencyTreeNode.resolveResources.map(function (resolveResource) {
            return _this.findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource.resourceId).map(function (x) {
                return {
                    resourceId: resolveResource.resourceId,
                    resourceName: resolveResource.resourceName,
                    resourceType: x.resourceType,
                    versionId: x.versionId,
                    version: x.version,
                    versionRange: x.versionRange,
                    fileSha1: x.fileSha1,
                    contracts: resolveResource.contracts,
                    children: recursionAuthTree(x)
                };
            });
        }); };
        return recursionAuthTree((0, lodash_1.first)(dependencyTree)).filter(function (x) { return x.length; });
    };
    /**
     * 获取关系树(资源=>资源的依赖=>依赖的上抛,最多三层)
     * @param versionInfo
     * @param dependencyTree
     */
    ResourceService.prototype.getRelationTree = function (versionInfo, dependencyTree) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var resourceTypeMap, resourceIds;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!dependencyTree) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getResourceDependencyTree({}, versionInfo, { isContainRootNode: true })];
                    case 1:
                        dependencyTree = _c.sent();
                        _c.label = 2;
                    case 2:
                        resourceTypeMap = new Map();
                        resourceIds = (_a = (0, lodash_1.first)(dependencyTree).dependencies) === null || _a === void 0 ? void 0 : _a.map(function (dependency) { return dependency.baseUpcastResources.map(function (x) { return x.resourceId; }); }).flat();
                        if (!resourceIds.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resourceProvider.find({ _id: { $in: resourceIds } }, '_id resourceType').then(function (list) {
                                list.forEach(function (x) { return resourceTypeMap.set(x.resourceId, x.resourceType); });
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/, [{
                                resourceId: versionInfo.resourceId,
                                resourceName: versionInfo.resourceName,
                                resourceType: versionInfo.resourceType,
                                versionRanges: [],
                                versions: [versionInfo.version],
                                versionIds: [versionInfo.versionId],
                                resolveResources: versionInfo.resolveResources,
                                children: (_b = (0, lodash_1.first)(dependencyTree).dependencies) === null || _b === void 0 ? void 0 : _b.map(function (dependency) {
                                    return {
                                        resourceId: dependency.resourceId,
                                        resourceName: dependency.resourceName,
                                        resourceType: dependency.resourceType,
                                        versionRanges: [dependency.versionRange],
                                        versions: [dependency.version],
                                        versionIds: [dependency.versionId],
                                        resolveResources: dependency.resolveResources,
                                        children: dependency.baseUpcastResources.map(function (upcastResource) {
                                            var resolveVersions = (0, lodash_1.uniqBy)(_this.findResourceVersionFromDependencyTree(dependency.dependencies, upcastResource.resourceId), 'versionId');
                                            return {
                                                resourceId: upcastResource.resourceId,
                                                resourceName: upcastResource.resourceName,
                                                resourceType: resourceTypeMap.get(upcastResource.resourceId),
                                                versionRanges: resolveVersions.map(function (x) { return x.versionRange; }),
                                                versions: resolveVersions.map(function (x) { return x.version; }),
                                                versionIds: resolveVersions.map(function (x) { return x.versionId; }),
                                                children: []
                                            };
                                        })
                                    };
                                })
                            }]];
                }
            });
        });
    };
    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames 资源名称集
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    ResourceService.prototype.findByResourceNames = function (resourceNames) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var uniqueKeys;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                uniqueKeys = resourceNames.map(function (x) { return _this.resourcePropertyGenerator.generateResourceUniqueKey(x); });
                return [2 /*return*/, (_a = this.resourceProvider).find.apply(_a, __spreadArray([{ uniqueKey: { $in: uniqueKeys } }], args, false))];
            });
        });
    };
    /**
     * 根据资源ID获取资源信息
     * @param resourceId
     * @param args
     */
    ResourceService.prototype.findByResourceId = function (resourceId) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceProvider).findById.apply(_a, __spreadArray([resourceId], args, false))];
            });
        });
    };
    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    ResourceService.prototype.findOneByResourceName = function (resourceName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var uniqueKey;
            var _a;
            return __generator(this, function (_b) {
                uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceName);
                return [2 /*return*/, (_a = this.resourceProvider).findOne.apply(_a, __spreadArray([{ uniqueKey: uniqueKey }], args, false))];
            });
        });
    };
    ResourceService.prototype.findUserCreatedResourceCounts = function (userIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceProvider.aggregate([
                        {
                            $match: { userId: { $in: userIds } }
                        },
                        {
                            $group: { _id: '$userId', count: { '$sum': 1 } }
                        },
                        {
                            $project: { _id: 0, userId: '$_id', count: '$count' }
                        }
                    ])];
            });
        });
    };
    /**
     * 根据条件查找单个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    ResourceService.prototype.findOne = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceProvider).findOne.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    /**
     * 根据条件查询多个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    ResourceService.prototype.find = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceProvider).find.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    ResourceService.prototype.findIntervalList = function (condition, skip, limit, projection, sort) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceProvider.findIntervalList(condition, skip, limit, projection === null || projection === void 0 ? void 0 : projection.toString(), sort)];
            });
        });
    };
    /**
     * 按条件统计资源数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    ResourceService.prototype.count = function (condition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceProvider.count(condition)];
            });
        });
    };
    /**
     * 冻结或解封资源
     * @param resourceInfo
     * @param remark
     */
    ResourceService.prototype.freezeOrDeArchiveResource = function (resourceInfo, remark) {
        return __awaiter(this, void 0, void 0, function () {
            var operatorType, operatorRecordInfo, resourceStatus, session;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operatorType = [2, 3].includes(resourceInfo.status) ? 2 : 1;
                        operatorRecordInfo = {
                            operatorUserId: this.ctx.userId,
                            operatorUserName: this.ctx.identityInfo.userInfo.username,
                            type: operatorType, remark: remark !== null && remark !== void 0 ? remark : ''
                        };
                        resourceStatus = operatorType === 1 ? (resourceInfo.status === 0 ? 2 : 3) : operatorType === 2 ? (resourceInfo.status === 2 ? 0 : 1) : -1;
                        return [4 /*yield*/, this.resourceProvider.model.startSession()];
                    case 1:
                        session = _a.sent();
                        return [4 /*yield*/, session.withTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, { status: resourceStatus }, { session: session })];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, this.resourceFreezeRecordProvider.findOneAndUpdate({ resourceId: resourceInfo.resourceId }, {
                                                    $push: { records: operatorRecordInfo }
                                                }, { session: session }).then(function (model) {
                                                    return model || _this.resourceFreezeRecordProvider.create([{
                                                            resourceId: resourceInfo.resourceId,
                                                            resourceName: resourceInfo.resourceName,
                                                            records: [operatorRecordInfo]
                                                        }], { session: session });
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })["catch"](function (error) {
                                throw error;
                            })["finally"](function () {
                                session.endSession();
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 查找资源标签
     * @param condition
     * @param args
     */
    ResourceService.prototype.findResourceTags = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceTagProvider).find.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    /**
     * 分页查找资源标签
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    ResourceService.prototype.findIntervalResourceTagList = function (condition, skip, limit, projection, sort) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceTagProvider.findIntervalList(condition, skip, limit, projection === null || projection === void 0 ? void 0 : projection.toString(), sort)];
            });
        });
    };
    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    ResourceService.prototype.createdResourceVersionHandle = function (resourceInfo, versionInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var latestVersionInfo, modifyModel;
            return __generator(this, function (_a) {
                resourceInfo.resourceVersions.push((0, lodash_1.pick)(versionInfo, ['version', 'versionId', 'createDate']));
                latestVersionInfo = resourceInfo.resourceVersions.sort(function (x, y) { return semver.lt(x['version'], y['version']) ? 1 : -1; }).shift();
                modifyModel = {
                    $addToSet: { resourceVersions: versionInfo },
                    latestVersion: latestVersionInfo.version,
                    status: ResourceService_1._getResourceStatus([versionInfo], resourceInfo.policies)
                };
                if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
                    modifyModel.baseUpcastResources = versionInfo.upcastResources;
                }
                return [2 /*return*/, this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, modifyModel).then(function (data) { return Boolean(data.ok); })];
            });
        });
    };
    /**
     * 创建资源标签
     * @param model
     */
    ResourceService.prototype.createResourceTag = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var tagInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.resourceTagProvider.findOne({ tagName: model.tagName })];
                    case 1:
                        tagInfo = _a.sent();
                        if (tagInfo) {
                            throw new egg_freelog_base_1.ArgumentError('tag已经存在,不能重复创建');
                        }
                        return [2 /*return*/, this.resourceTagProvider.create(model)];
                }
            });
        });
    };
    /**
     * 更新资源标签
     * @param tagId
     * @param model
     */
    ResourceService.prototype.updateResourceTag = function (tagId, model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceTagProvider.updateOne({ _id: tagId }, model).then(function (t) { return Boolean(t.ok); })];
            });
        });
    };
    /**
     * 过滤掉不可用的标签
     * @param resourceType
     * @param resourceTags
     */
    ResourceService.prototype.filterResourceTag = function (resourceType, resourceTags) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, usableTags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        condition = {
                            authority: 1,
                            $or: [{ resourceRangeType: 3 },
                                { resourceRangeType: 1, resourceRange: resourceType },
                                {
                                    resourceRangeType: 2,
                                    resourceRange: { $ne: resourceType }
                                }]
                        };
                        return [4 /*yield*/, this.findResourceTags(condition, 'tagName tagType')];
                    case 1:
                        usableTags = _a.sent();
                        return [2 /*return*/, (0, lodash_1.intersectionWith)(resourceTags, usableTags, function (x, y) { return x === y.tagName; })];
                }
            });
        });
    };
    /**
     * 策略校验
     * @param policies
     */
    ResourceService.prototype._validateAndCreateSubjectPolicies = function (policies) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var policyInfos, result, i, j, policyInfo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((0, lodash_1.isEmpty)(policies)) {
                            return [2 /*return*/, []];
                        }
                        // 名称不允许重复
                        if ((0, lodash_1.uniqBy)(policies, 'policyName').length !== policies.length) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
                        }
                        return [4 /*yield*/, this.outsideApiService.createPolicies(policies.map(function (x) { return x.policyText; }))];
                    case 1:
                        policyInfos = _b.sent();
                        if (policyInfos.length !== policies.length) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-create-failed'));
                        }
                        if ((0, lodash_1.uniqBy)(policyInfos, 'policyId').length !== policyInfos.length) {
                            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
                        }
                        result = [];
                        for (i = 0, j = policyInfos.length; i < j; i++) {
                            policyInfo = policyInfos[i];
                            result.push({
                                policyId: policyInfo.policyId,
                                policyText: policyInfo.policyText,
                                fsmDescriptionInfo: policyInfo.fsmDescriptionInfo,
                                policyName: policies[i].policyName,
                                status: (_a = policies[i].status) !== null && _a !== void 0 ? _a : 1,
                            });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 构建依赖树
     * @param dependencies
     * @param {number} maxDeep
     * @param {number} currDeep
     * @param {any[]} omitFields
     * @returns {Promise<any>}
     * @private
     */
    ResourceService.prototype._buildDependencyTree = function (dependencies, maxDeep, currDeep, omitFields) {
        if (maxDeep === void 0) { maxDeep = 100; }
        if (currDeep === void 0) { currDeep = 1; }
        if (omitFields === void 0) { omitFields = []; }
        return __awaiter(this, void 0, void 0, function () {
            var dependencyMap, resourceList, versionIds, _i, resourceList_1, _a, resourceId, resourceVersions, dependencyInfo, _b, version, versionId, versionInfoMap, tasks, results, _loop_1, this_1, _c, resourceList_2, _d, resourceId, resourceName, resourceType, baseUpcastResources;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if ((0, lodash_1.isEmpty)(dependencies !== null && dependencies !== void 0 ? dependencies : []) || currDeep++ > maxDeep) {
                            return [2 /*return*/, []];
                        }
                        dependencyMap = new Map(dependencies.map(function (item) { return [item.resourceId, { versionRange: item.versionRange }]; }));
                        return [4 /*yield*/, this.resourceProvider.find({ _id: { $in: Array.from(dependencyMap.keys()) } })];
                    case 1:
                        resourceList = _e.sent();
                        versionIds = [];
                        for (_i = 0, resourceList_1 = resourceList; _i < resourceList_1.length; _i++) {
                            _a = resourceList_1[_i], resourceId = _a.resourceId, resourceVersions = _a.resourceVersions;
                            dependencyInfo = dependencyMap.get(resourceId);
                            _b = this._getResourceMaxSatisfying(resourceVersions, dependencyInfo.versionRange), version = _b.version, versionId = _b.versionId;
                            dependencyInfo.version = version;
                            dependencyInfo.versionId = versionId;
                            dependencyInfo.versions = resourceVersions.map(function (x) { return x.version; });
                            versionIds.push(dependencyInfo.versionId);
                        }
                        return [4 /*yield*/, this.resourceVersionService.find({ versionId: { $in: versionIds } })
                                .then(function (list) { return new Map(list.map(function (x) { return [x.versionId, x]; })); })];
                    case 2:
                        versionInfoMap = _e.sent();
                        tasks = [];
                        results = [];
                        _loop_1 = function (resourceId, resourceName, resourceType, baseUpcastResources) {
                            var _f = dependencyMap.get(resourceId), versionId = _f.versionId, versionRange = _f.versionRange, versions = _f.versions, version = _f.version;
                            var versionInfo = versionInfoMap.get(versionId);
                            var result = {
                                resourceId: resourceId,
                                resourceName: resourceName,
                                versions: versions,
                                version: version,
                                resourceType: resourceType,
                                versionRange: versionRange,
                                baseUpcastResources: baseUpcastResources,
                                versionId: versionId,
                                fileSha1: versionInfo.fileSha1, resolveResources: versionInfo.resolveResources,
                                dependencies: []
                            };
                            if (!(0, lodash_1.isEmpty)(omitFields)) {
                                result = (0, lodash_1.omit)(result, omitFields);
                            }
                            tasks.push(this_1._buildDependencyTree(versionInfo.dependencies || [], maxDeep, currDeep, omitFields)
                                .then(function (list) { return result.dependencies = list; }));
                            results.push(result);
                        };
                        this_1 = this;
                        for (_c = 0, resourceList_2 = resourceList; _c < resourceList_2.length; _c++) {
                            _d = resourceList_2[_c], resourceId = _d.resourceId, resourceName = _d.resourceName, resourceType = _d.resourceType, baseUpcastResources = _d.baseUpcastResources;
                            _loop_1(resourceId, resourceName, resourceType, baseUpcastResources);
                        }
                        return [2 /*return*/, Promise.all(tasks).then(function () { return results; })];
                }
            });
        });
    };
    /**
     * 从依赖树中获取所有相关的版本信息
     * @param dependencyTree
     */
    // async _getAllVersionInfoFormDependencyTree(dependencyTree: any[]): Promise<ResourceVersionInfo[]> {
    //
    //     const resourceVersionIdSet = new Set();
    //     const recursion = (dependencies) => dependencies.forEach((item) => {
    //         resourceVersionIdSet.add(item.versionId);
    //         recursion(item.dependencies);
    //     });
    //     recursion(dependencyTree);
    //
    //     if (!resourceVersionIdSet.size) {
    //         return [];
    //     }
    //     return this.resourceVersionService.find({versionId: {$in: [...resourceVersionIdSet.values()]}});
    // }
    /**
     * 从依赖树中获取指定的所有发行版本(查找多重上抛)
     * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
     * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
     * @param dependencies
     * @param resourceId
     * @param _list
     */
    ResourceService.prototype.findResourceVersionFromDependencyTree = function (dependencies, resourceId, _list) {
        var _this = this;
        if (_list === void 0) { _list = []; }
        return dependencies.reduce(function (acc, dependencyTreeNode) {
            if (dependencyTreeNode.resourceId === resourceId) {
                acc.push(dependencyTreeNode);
            }
            // 如果依赖项未上抛该发行,则终止检查子级节点
            if (!dependencyTreeNode.baseUpcastResources.some(function (x) { return x.resourceId === resourceId; })) {
                return acc;
            }
            return _this.findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resourceId, acc);
        }, _list);
    };
    /**
     * 获取最匹配的semver版本
     * @param resourceVersions
     * @param versionRange
     * @returns {any}
     * @private
     */
    ResourceService.prototype._getResourceMaxSatisfying = function (resourceVersions, versionRange) {
        var version = (0, semver_1.maxSatisfying)(resourceVersions.map(function (x) { return x.version; }), versionRange);
        return resourceVersions.find(function (x) { return x.version === version; });
    };
    /**
     * 给资源填充最新版本详情信息
     * @param resources
     */
    ResourceService.prototype.fillResourceLatestVersionInfo = function (resources) {
        return __awaiter(this, void 0, void 0, function () {
            var versionIds, versionInfoMap;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, lodash_1.isArray)(resources) || (0, lodash_1.isEmpty)(resources)) {
                            return [2 /*return*/, resources];
                        }
                        versionIds = resources.filter(function (x) { return (0, lodash_1.isString)(x === null || x === void 0 ? void 0 : x.latestVersion) && x.latestVersion.length; }).map(function (resourceInfo) {
                            var versionId = _this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
                            resourceInfo['latestVersionId'] = versionId;
                            return versionId;
                        });
                        if ((0, lodash_1.isEmpty)(versionIds)) {
                            return [2 /*return*/, resources];
                        }
                        return [4 /*yield*/, this.resourceVersionService.find({ versionId: { $in: versionIds } }).then(function (list) {
                                return new Map(list.map(function (x) { return [x.versionId, x]; }));
                            })];
                    case 1:
                        versionInfoMap = _a.sent();
                        return [2 /*return*/, resources.map(function (item) {
                                var _a;
                                var resourceLatestVersionId = item.latestVersionId;
                                var resourceInfo = item.toObject ? item.toObject() : item;
                                resourceInfo.latestVersionInfo = (_a = versionInfoMap.get(resourceLatestVersionId)) !== null && _a !== void 0 ? _a : {};
                                return resourceInfo;
                            })];
                }
            });
        });
    };
    /**
     * 给资源填充策略详情信息
     * @param resources
     */
    ResourceService.prototype.fillResourcePolicyInfo = function (resources) {
        return __awaiter(this, void 0, void 0, function () {
            var policyIds, policyMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, lodash_1.isArray)(resources) || (0, lodash_1.isEmpty)(resources)) {
                            return [2 /*return*/, resources];
                        }
                        policyIds = (0, lodash_1.chain)(resources).filter(function (x) { return (0, lodash_1.isArray)(x === null || x === void 0 ? void 0 : x.policies) && !(0, lodash_1.isEmpty)(x.policies); }).map(function (x) { return x.policies.map(function (m) { return m.policyId; }); }).flatten().uniq().value();
                        if ((0, lodash_1.isEmpty)(policyIds)) {
                            return [2 /*return*/, resources];
                        }
                        return [4 /*yield*/, this.outsideApiService.getResourcePolicies(policyIds, ['policyId', 'policyText', 'fsmDescriptionInfo']).then(function (list) {
                                return new Map(list.map(function (x) { return [x.policyId, x]; }));
                            })];
                    case 1:
                        policyMap = _a.sent();
                        return [2 /*return*/, resources.map(function (item) {
                                var resourceInfo = item.toObject ? item.toObject() : item;
                                resourceInfo.policies.forEach(function (policyInfo) {
                                    var _a;
                                    var _b = (_a = policyMap.get(policyInfo.policyId)) !== null && _a !== void 0 ? _a : {}, policyText = _b.policyText, fsmDescriptionInfo = _b.fsmDescriptionInfo;
                                    policyInfo.policyText = policyText;
                                    policyInfo.fsmDescriptionInfo = fsmDescriptionInfo;
                                });
                                return resourceInfo;
                            })];
                }
            });
        });
    };
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param resourceVersions
     * @param policies
     */
    ResourceService._getResourceStatus = function (resourceVersions, policies) {
        return (policies.some(function (x) { return x.status === 1; }) && !(0, lodash_1.isEmpty)(resourceVersions)) ? 1 : 0;
    };
    var ResourceService_1;
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "resourceProvider");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "resourceTagProvider");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "resourceFreezeRecordProvider");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "resourcePropertyGenerator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "outsideApiService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceService.prototype, "resourceVersionService");
    ResourceService = ResourceService_1 = __decorate([
        (0, midway_1.provide)('resourceService')
    ], ResourceService);
    return ResourceService;
}());
exports.ResourceService = ResourceService;
