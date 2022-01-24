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
exports.ResourceAuthService = void 0;
var midway_1 = require("midway");
var lodash_1 = require("lodash");
var auth_interface_1 = require("../../auth-interface");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceAuthService = /** @class */ (function () {
    function ResourceAuthService() {
    }
    /**
     * 资源授权
     * @param versionInfo
     * @param isIncludeUpstreamAuth
     */
    ResourceAuthService.prototype.resourceAuth = function (versionInfo, isIncludeUpstreamAuth) {
        return __awaiter(this, void 0, void 0, function () {
            var authResult, resourceAuthTree, allContractIds, contractMap, resourceResolveAuthFailedDependencies, resourceUpstreamAuthFailedDependencies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
                        if ((0, lodash_1.isEmpty)(versionInfo.resolveResources)) {
                            return [2 /*return*/, authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnDefaultAuth)];
                        }
                        return [4 /*yield*/, this.resourceService.getResourceAuthTree(versionInfo)];
                    case 1:
                        resourceAuthTree = _a.sent();
                        allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree);
                        return [4 /*yield*/, this.outsideApiService.getContractByContractIds(allContractIds, {
                                projection: 'subjectId,subjectType,authStatus'
                            }).then(function (list) { return new Map(list.map(function (x) { return [x.contractId, x]; })); })];
                    case 2:
                        contractMap = _a.sent();
                        resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 1, 1);
                        if (!(0, lodash_1.isEmpty)(resourceResolveAuthFailedDependencies)) {
                            return [2 /*return*/, authResult.setErrorMsg('资源自身合约授权未通过')
                                    .setData({ resourceResolveAuthFailedDependencies: resourceResolveAuthFailedDependencies })
                                    .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized)];
                        }
                        resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
                        if (!(0, lodash_1.isEmpty)(resourceUpstreamAuthFailedDependencies)) {
                            return [2 /*return*/, authResult.setErrorMsg('资源上游合约授权未通过')
                                    .setData({ resourceUpstreamAuthFailedDependencies: resourceUpstreamAuthFailedDependencies })
                                    .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized)
                                    .setErrorMsg('资源上游合约授权未通过')];
                        }
                        return [2 /*return*/, authResult];
                }
            });
        });
    };
    /**
     * 资源上游授权(不包含自身)
     * @param resourceAuthTree
     */
    ResourceAuthService.prototype.resourceUpstreamAuth = function (resourceAuthTree) {
        return __awaiter(this, void 0, void 0, function () {
            var authResult, allContractIds, contractMap, resourceUpstreamAuthFailedDependencies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
                        allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree, 2);
                        return [4 /*yield*/, this.outsideApiService.getContractByContractIds(allContractIds, {
                                projection: 'subjectId,subjectType,authStatus'
                            }).then(function (list) { return new Map(list.map(function (x) { return [x.contractId, x]; })); })];
                    case 1:
                        contractMap = _a.sent();
                        resourceUpstreamAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER);
                        if ((0, lodash_1.isEmpty)(resourceUpstreamAuthFailedDependencies)) {
                            return [2 /*return*/, authResult];
                        }
                        return [2 /*return*/, authResult.setErrorMsg('资源上游合约授权未通过')
                                .setData({ resourceUpstreamAuthFailedDependencies: resourceUpstreamAuthFailedDependencies })
                                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过')];
                }
            });
        });
    };
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     * @param authType
     */
    ResourceAuthService.prototype.resourceBatchAuth = function (resourceVersions, authType) {
        return __awaiter(this, void 0, void 0, function () {
            var authResultMap, allContractIds, contractMap_1, _i, resourceVersions_1, resourceVersion, _a, _b, resolveResource, contracts, authResult;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        authResultMap = new Map();
                        allContractIds = (0, lodash_1.chain)(resourceVersions).map(function (x) { return x.resolveResources; }).flattenDeep().map(function (x) { return x.contracts; }).flattenDeep().map(function (x) { return x.contractId; }).uniq().value();
                        if (!!(0, lodash_1.isEmpty)(allContractIds)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(function (list) {
                                return new Map(list.map(function (x) { return [x.contractId, x]; }));
                            })];
                    case 1:
                        contractMap_1 = _c.sent();
                        for (_i = 0, resourceVersions_1 = resourceVersions; _i < resourceVersions_1.length; _i++) {
                            resourceVersion = resourceVersions_1[_i];
                            for (_a = 0, _b = resourceVersion.resolveResources; _a < _b.length; _a++) {
                                resolveResource = _b[_a];
                                contracts = resolveResource.contracts.map(function (x) { return contractMap_1.get(x.contractId); });
                                authResult = this.contractAuth(resolveResource.resourceId, contracts, authType);
                                authResultMap.set(resourceVersion.versionId + "_" + resolveResource.resourceId, authResult);
                            }
                        }
                        _c.label = 2;
                    case 2: return [2 /*return*/, resourceVersions.map(function (resourceVersion) { return Object({
                            resourceId: resourceVersion.resourceId,
                            resourceName: resourceVersion.resourceName,
                            versionId: resourceVersion.versionId,
                            version: resourceVersion.version,
                            resolveResourceAuthResults: resourceVersion.resolveResources.map(function (resolveResource) {
                                var resourceId = resolveResource.resourceId, resourceName = resolveResource.resourceName;
                                var authResult = authResultMap.get(resourceVersion.versionId + "_" + resourceId);
                                return {
                                    resourceId: resourceId,
                                    resourceName: resourceName,
                                    authResult: authResult,
                                    contractIds: resolveResource.contracts.map(function (x) { return x.contractId; })
                                };
                            })
                        }); })];
                }
            });
        });
    };
    /**
     * 资源关系树
     * @param resourceInfo
     * @param versionInfo
     */
    ResourceAuthService.prototype.resourceRelationTreeAuth = function (resourceInfo, versionInfo) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var options, dependencyTree, flattenResourceDependencyTree, authCheck, flattenList, allContractIds, contractMap, resourceTypeMap, resourceIds, relationTree, _loop_1, this_1, _i, _f, dependency;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        options = { maxDeep: 999, omitFields: [], isContainRootNode: true };
                        return [4 /*yield*/, this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options).then(lodash_1.first)];
                    case 1:
                        dependencyTree = _g.sent();
                        flattenResourceDependencyTree = function (dependencyTree, list) {
                            if (list === void 0) { list = []; }
                            for (var _i = 0, dependencyTree_1 = dependencyTree; _i < dependencyTree_1.length; _i++) {
                                var dependencyInfo = dependencyTree_1[_i];
                                list.push.apply(list, __spreadArray([dependencyInfo], flattenResourceDependencyTree(dependencyInfo.dependencies), false));
                            }
                            return list;
                        };
                        authCheck = function (dependencyTree) {
                            var authFailedResources = [];
                            for (var _i = 0, dependencyTree_2 = dependencyTree; _i < dependencyTree_2.length; _i++) {
                                var item = dependencyTree_2[_i];
                                var contracts = item.resolveResources.map(function (x) { return x.contracts; }).flat().map(function (x) { return contractMap.get(x.contractId); });
                                if (!_this.contractAuth(item.resourceId, contracts, 'auth').isAuth) {
                                    authFailedResources.push(item);
                                }
                            }
                            return authFailedResources;
                        };
                        flattenList = flattenResourceDependencyTree([dependencyTree]);
                        allContractIds = (0, lodash_1.chain)(flattenList).map(function (x) { return x.resolveResources.map(function (m) { return m.contracts; }); }).flattenDeep().map(function (x) { return x.contractId; }).value();
                        return [4 /*yield*/, this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(function (list) {
                                return new Map(list.map(function (x) { return [x.contractId, x]; }));
                            })];
                    case 2:
                        contractMap = _g.sent();
                        resourceTypeMap = new Map();
                        resourceIds = (_a = dependencyTree.dependencies) === null || _a === void 0 ? void 0 : _a.map(function (dependency) { return dependency.baseUpcastResources.map(function (x) { return x.resourceId; }); }).flat();
                        if (!!(0, lodash_1.isEmpty)(resourceIds)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resourceService.find({ _id: { $in: resourceIds } }, '_id resourceType').then(function (list) {
                                list.forEach(function (x) { return resourceTypeMap.set(x.resourceId, x.resourceType); });
                            })];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        relationTree = {
                            resourceId: versionInfo.resourceId,
                            resourceName: versionInfo.resourceName,
                            resourceType: versionInfo.resourceType,
                            versionRanges: [],
                            versions: [versionInfo.version],
                            versionIds: [versionInfo.versionId],
                            children: []
                        };
                        _loop_1 = function (dependency) {
                            var dependRelationTree = {
                                resourceId: dependency.resourceId,
                                resourceName: dependency.resourceName,
                                resourceType: dependency.resourceType,
                                versionRanges: [dependency.versionRange],
                                versions: [dependency.version],
                                versionIds: [dependency.versionId],
                                children: []
                            };
                            var subDependencyAuthTree = (0, lodash_1.isEmpty)(dependency.resolveResources) ? [] : this_1.resourceService.findResourceVersionFromDependencyTree(dependencyTree.dependencies, dependency.resourceId);
                            var selfAndUpstreamResolveResources = flattenResourceDependencyTree(subDependencyAuthTree).filter(function (x) { return !(0, lodash_1.isEmpty)(x.resolveResources); });
                            var selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
                            dependRelationTree.downstreamAuthContractIds = (_c = (_b = versionInfo.resolveResources.find(function (x) { return x.resourceId === dependency.resourceId; })) === null || _b === void 0 ? void 0 : _b.contracts) !== null && _c !== void 0 ? _c : [];
                            dependRelationTree.downstreamIsAuth = (0, lodash_1.isEmpty)(dependRelationTree.downstreamAuthContractIds) || this_1.contractAuth(dependency.resourceId, dependRelationTree.downstreamAuthContractIds.map(function (x) { return contractMap.get(x.contractId); }), 'auth').isAuth;
                            dependRelationTree.selfAndUpstreamIsAuth = (0, lodash_1.isEmpty)(selfAndUpstreamResolveResources) || (0, lodash_1.isEmpty)(selfAndUpstreamAuthFailedResources);
                            var _loop_2 = function (upcast) {
                                var downstreamAuthContractIds = (_e = (_d = versionInfo.resolveResources.find(function (x) { return x.resourceId === upcast.resourceId; })) === null || _d === void 0 ? void 0 : _d.contracts) !== null && _e !== void 0 ? _e : [];
                                var downstreamIsAuth = (0, lodash_1.isEmpty)(downstreamAuthContractIds) || this_1.contractAuth(upcast.resourceId, downstreamAuthContractIds.map(function (x) { return contractMap.get(x.contractId); }), 'auth').isAuth;
                                var subUpcastAuthTree = this_1.resourceService.findResourceVersionFromDependencyTree(dependency.dependencies, upcast.resourceId).filter(function (x) { return !(0, lodash_1.isEmpty)(x.resolveResources); });
                                var selfAndUpstreamResolveResources_1 = flattenResourceDependencyTree(subUpcastAuthTree).filter(function (x) { return !(0, lodash_1.isEmpty)(x.resolveResources); });
                                var selfAndUpstreamAuthFailedResources_1 = authCheck(selfAndUpstreamResolveResources_1);
                                var selfAndUpstreamIsAuth = (0, lodash_1.isEmpty)(selfAndUpstreamResolveResources_1) || (0, lodash_1.isEmpty)(selfAndUpstreamAuthFailedResources_1);
                                var resolveVersions = (0, lodash_1.uniqBy)(subUpcastAuthTree, 'versionId');
                                var upcastRelationTree = {
                                    resourceId: upcast.resourceId,
                                    resourceName: upcast.resourceName,
                                    resourceType: resourceTypeMap.get(upcast.resourceId),
                                    versionRanges: resolveVersions.map(function (x) { return x.versionRange; }),
                                    versions: resolveVersions.map(function (x) { return x.version; }),
                                    versionIds: resolveVersions.map(function (x) { return x.versionId; }),
                                    downstreamIsAuth: downstreamIsAuth,
                                    selfAndUpstreamIsAuth: selfAndUpstreamIsAuth,
                                    downstreamAuthContractIds: downstreamAuthContractIds,
                                    children: []
                                };
                                dependRelationTree.children.push(upcastRelationTree);
                            };
                            for (var _h = 0, _j = dependency.baseUpcastResources; _h < _j.length; _h++) {
                                var upcast = _j[_h];
                                _loop_2(upcast);
                            }
                            relationTree.children.push(dependRelationTree);
                        };
                        this_1 = this;
                        for (_i = 0, _f = dependencyTree.dependencies; _i < _f.length; _i++) {
                            dependency = _f[_i];
                            _loop_1(dependency);
                        }
                        return [2 /*return*/, [relationTree]];
                }
            });
        });
    };
    /**
     * 合同授权
     * @param subjectId
     * @param contracts
     * @param authType
     */
    ResourceAuthService.prototype.contractAuth = function (subjectId, contracts, authType) {
        var authResult = new auth_interface_1.SubjectAuthResult();
        if (!(0, lodash_1.isArray)(contracts) || (0, lodash_1.isEmpty)(contracts)) {
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        var invalidContracts = contracts.filter(function (x) { return (x === null || x === void 0 ? void 0 : x.subjectType) !== egg_freelog_base_1.SubjectTypeEnum.Resource || (x === null || x === void 0 ? void 0 : x.subjectId) !== subjectId; });
        if (!(0, lodash_1.isEmpty)(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({ invalidContracts: invalidContracts })
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractInvalid);
        }
        var isExistAuthContracts = contracts.some(function (x) { return (authType === 'auth' ? x.isAuth : (x.isAuth || x.isTestAuth)); });
        if (!isExistAuthContracts) {
            return authResult.setErrorMsg('合约授权未通过')
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
    };
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    ResourceAuthService.prototype._getAuthFailedResourceFromAuthTree = function (authTree, contractMap, startDeep, endDeep) {
        var _this = this;
        var recursion = function (list, deep, authFailedResources) {
            var _a;
            if (deep === void 0) { deep = 1; }
            if (deep < startDeep || deep > endDeep) {
                return authFailedResources;
            }
            var _loop_3 = function (allVersionResources) {
                var resourceInfo = (0, lodash_1.first)(allVersionResources);
                if ((0, lodash_1.isEmpty)((_a = resourceInfo.contracts) !== null && _a !== void 0 ? _a : [])) {
                    return "continue";
                }
                var authResult = _this.contractAuth(resourceInfo.resourceId, resourceInfo.contracts.map(function (x) { return contractMap.get(x.contractId); }), 'auth');
                if (!authResult.isAuth) {
                    var contractIds_1 = deep === 1 ? resourceInfo.contracts.map(function (x) { return x.contractId; }) : [];
                    allVersionResources.forEach(function (x) { return authFailedResources.push({
                        resourceId: resourceInfo.resourceId, version: x.version,
                        deep: deep,
                        contractIds: contractIds_1
                    }); }); // 当deep=1时,可以考虑把contractId展示出来.需要看前端有没有直接执行合约的需求
                }
                for (var _b = 0, allVersionResources_1 = allVersionResources; _b < allVersionResources_1.length; _b++) {
                    var children = allVersionResources_1[_b].children;
                    recursion(children, deep + 1, authFailedResources);
                }
            };
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var allVersionResources = list_1[_i];
                _loop_3(allVersionResources);
            }
            return authFailedResources;
        };
        return recursion(authTree, 1, []);
    };
    /**
     * 从授权树中递归获取所有的合同ID
     * @param resourceAuthTree
     * @param startDeep
     * @param endDeep
     */
    ResourceAuthService.prototype._getContractIdFromResourceAuthTree = function (resourceAuthTree, startDeep, endDeep) {
        if (startDeep === void 0) { startDeep = 1; }
        if (endDeep === void 0) { endDeep = Number.MAX_SAFE_INTEGER; }
        function recursionPushContractId(authTree, allContractIds, deep) {
            var _a;
            if (deep === void 0) { deep = 1; }
            if (deep < startDeep || deep > endDeep) {
                return allContractIds;
            }
            for (var _i = 0, authTree_1 = authTree; _i < authTree_1.length; _i++) {
                var allResourceVersions = authTree_1[_i];
                for (var _b = 0, allResourceVersions_1 = allResourceVersions; _b < allResourceVersions_1.length; _b++) {
                    var resourceRelationAuthTree = allResourceVersions_1[_b];
                    (_a = resourceRelationAuthTree.contracts) === null || _a === void 0 ? void 0 : _a.forEach(function (x) { return allContractIds.push(x.contractId); });
                    recursionPushContractId(resourceRelationAuthTree.children, allContractIds, deep + 1);
                }
            }
            return allContractIds;
        }
        return recursionPushContractId(resourceAuthTree, [], 1);
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthService.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceAuthService.prototype, "outsideApiService");
    ResourceAuthService = __decorate([
        (0, midway_1.provide)()
    ], ResourceAuthService);
    return ResourceAuthService;
}());
exports.ResourceAuthService = ResourceAuthService;
