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
exports.ResourceController = void 0;
var semver = require("semver");
var validator_1 = require("validator");
var midway_1 = require("midway");
var lodash_1 = require("lodash");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceController = /** @class */ (function () {
    function ResourceController() {
    }
    ResourceController.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, skip, limit, sort, resourceType, omitResourceType, keywords, isSelf, projection, status, startResourceId, isLoadPolicyInfo, isLoadLatestVersionInfo, tags, condition, searchRegExp, pageResult, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ctx = this.ctx;
                        skip = ctx.checkQuery('skip').optional().toInt()["default"](0).ge(0).value;
                        limit = ctx.checkQuery('limit').optional().toInt()["default"](10).gt(0).lt(101).value;
                        sort = ctx.checkQuery('sort').optional().toSortObject().value;
                        resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
                        omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
                        keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
                        isSelf = ctx.checkQuery('isSelf').optional()["default"](0).toInt()["in"]([0, 1]).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        status = ctx.checkQuery('status').optional().toInt()["in"]([0, 1, 2]).value;
                        startResourceId = ctx.checkQuery('startResourceId').optional().isResourceId().value;
                        isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt()["in"]([0, 1]).value;
                        isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt()["in"]([0, 1]).value;
                        tags = ctx.checkQuery('tags').optional().toSplitArray().len(1, 5).value;
                        // const platformTags = ctx.checkQuery('platformTags').optional().toSplitArray().len(1, 10).value;
                        ctx.validateParams();
                        condition = {};
                        if (isSelf) {
                            ctx.validateVisitorIdentity(egg_freelog_base_1.IdentityTypeEnum.LoginUser);
                            condition.userId = ctx.userId;
                        }
                        if ((0, lodash_1.isString)(resourceType)) { // resourceType 与 omitResourceType互斥
                            condition.resourceType = new RegExp("^" + resourceType + "$", 'i');
                        }
                        else if ((0, lodash_1.isString)(omitResourceType)) {
                            condition.resourceType = { $ne: omitResourceType };
                        }
                        if ((0, lodash_1.includes)([0, 1], status)) {
                            condition.status = status;
                        }
                        if ((0, lodash_1.isString)(keywords) && keywords.length > 0) {
                            searchRegExp = new RegExp(keywords, 'i');
                            condition.$or = [{ resourceName: searchRegExp }, { resourceType: searchRegExp }];
                        }
                        if (!(0, lodash_1.isUndefined)(startResourceId)) {
                            condition._id = { $lt: startResourceId };
                        }
                        if (!(0, lodash_1.isEmpty)(tags)) {
                            condition.tags = { $in: tags };
                        }
                        return [4 /*yield*/, this.resourceService.findIntervalList(condition, skip, limit, projection, sort !== null && sort !== void 0 ? sort : { updateDate: -1 })];
                    case 1:
                        pageResult = _c.sent();
                        if (!isLoadPolicyInfo) return [3 /*break*/, 3];
                        _a = pageResult;
                        return [4 /*yield*/, this.resourceService.fillResourcePolicyInfo(pageResult.dataList)];
                    case 2:
                        _a.dataList = _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!isLoadLatestVersionInfo) return [3 /*break*/, 5];
                        _b = pageResult;
                        return [4 /*yield*/, this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList)];
                    case 4:
                        _b.dataList = _c.sent();
                        _c.label = 5;
                    case 5:
                        ctx.success(pageResult);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.esSearch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, skip, limit, sort, resourceType, omitResourceType, keywords, isSelf, projection, status, isLoadPolicyInfo, isLoadLatestVersionInfo, tags, pageResult, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ctx = this.ctx;
                        skip = ctx.checkQuery('skip').optional().toInt()["default"](0).ge(0).value;
                        limit = ctx.checkQuery('limit').optional().toInt()["default"](10).gt(0).lt(101).value;
                        sort = ctx.checkQuery('sort').optional().toSortObject().value;
                        resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
                        omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
                        keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
                        isSelf = ctx.checkQuery('isSelf').optional()["default"](0).toInt()["in"]([0, 1]).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        status = ctx.checkQuery('status').optional().toInt()["in"]([0, 1, 2]).value;
                        isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt()["in"]([0, 1]).value;
                        isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt()["in"]([0, 1]).value;
                        tags = ctx.checkQuery('tags').ignoreParamWhenEmpty().toSplitArray().len(1, 5).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.elasticSearchService.search(skip, limit, sort, keywords, isSelf ? ctx.userId : undefined, resourceType, omitResourceType, status, tags, projection)];
                    case 1:
                        pageResult = _c.sent();
                        if (!isLoadPolicyInfo) return [3 /*break*/, 3];
                        _a = pageResult;
                        return [4 /*yield*/, this.resourceService.fillResourcePolicyInfo(pageResult.dataList)];
                    case 2:
                        _a.dataList = _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!isLoadLatestVersionInfo) return [3 /*break*/, 5];
                        _b = pageResult;
                        return [4 /*yield*/, this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList)];
                    case 4:
                        _b.dataList = _c.sent();
                        _c.label = 5;
                    case 5:
                        ctx.success(pageResult);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 搜索关键字补全
     */
    ResourceController.prototype.keywordSuggest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, prefix;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        prefix = ctx.checkQuery('prefix').exist().len(1, 70).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.elasticSearchService.suggest(prefix).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.create = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var name, resourceType, policies, intro, coverImages, tags, _a, userId, username, model;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        name = ctx.checkBody('name').exist().isResourceName().trim().value;
                        resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
                        policies = ctx.checkBody('policies').optional()["default"]([]).isArray().value;
                        intro = ctx.checkBody('intro').optional()["default"]('').len(0, 1000).value;
                        coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10)["default"]([]).value;
                        tags = ctx.checkBody('tags').optional().isArray().len(0, 20)["default"]([]).value;
                        ctx.validateParams();
                        if (coverImages.some(function (x) { return !(0, validator_1.isURL)(x.toString(), { protocols: ['https'] }); })) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
                        }
                        this._policySchemaValidate(policies, 'addPolicy');
                        _a = ctx.identityInfo.userInfo, userId = _a.userId, username = _a.username;
                        return [4 /*yield*/, this.resourceService.findOneByResourceName(username + "/" + name, 'resourceName').then(function (data) {
                                if ((0, lodash_1.isString)(data === null || data === void 0 ? void 0 : data.resourceName)) {
                                    throw new egg_freelog_base_1.ArgumentError(ctx.gettext('name is already existing'));
                                }
                            })];
                    case 1:
                        _b.sent();
                        model = {
                            userId: userId,
                            username: username,
                            resourceType: resourceType,
                            name: name,
                            intro: intro,
                            coverImages: coverImages,
                            policies: policies,
                            tags: tags
                        };
                        return [4 /*yield*/, this.resourceService.createResource(model).then(ctx.success)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.createdCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, userIds, list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        userIds = ctx.checkQuery('userIds').exist().isSplitNumber().toSplitArray().len(1, 100).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findUserCreatedResourceCounts(userIds.map(function (x) { return parseInt(x); }))];
                    case 1:
                        list = _a.sent();
                        ctx.success(userIds.map(function (userId) {
                            var _a;
                            var record = list.find(function (x) { return x.userId.toString() === userId; });
                            return { userId: parseInt(userId), createdResourceCount: (_a = record === null || record === void 0 ? void 0 : record.count) !== null && _a !== void 0 ? _a : 0 };
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIds, resourceNames, isLoadPolicyInfo, isLoadLatestVersionInfo, projection, dataList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIds = ctx.checkQuery('resourceIds').optional().isSplitMongoObjectId().toSplitArray().value;
                        resourceNames = ctx.checkQuery('resourceNames').optional().decodeURIComponent().toSplitArray().value;
                        isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt()["in"]([0, 1]).value;
                        isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt()["in"]([0, 1]).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        dataList = [];
                        if (!!(0, lodash_1.isEmpty)(resourceIds)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resourceService.find({ _id: { $in: resourceIds } }, projection.join(' '))];
                    case 1:
                        dataList = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!!(0, lodash_1.isEmpty)(resourceNames)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resourceService.findByResourceNames(resourceNames, projection.join(' '))];
                    case 3:
                        dataList = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
                    case 5:
                        if (!isLoadPolicyInfo) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.resourceService.fillResourcePolicyInfo(dataList)];
                    case 6:
                        dataList = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!isLoadLatestVersionInfo) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.resourceService.fillResourceLatestVersionInfo(dataList)];
                    case 8:
                        dataList = _a.sent();
                        _a.label = 9;
                    case 9:
                        ctx.success(dataList);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, updatePolicies, addPolicies, intro, coverImages, tags, resourceInfo, updateResourceOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').isResourceId().value;
                        updatePolicies = ctx.checkBody('updatePolicies').optional().isArray().value;
                        addPolicies = ctx.checkBody('addPolicies').optional().isArray().value;
                        intro = ctx.checkBody('intro').optional().type('string').len(0, 1000).value;
                        coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).value;
                        tags = ctx.checkBody('tags').optional().isArray().len(0, 20).value;
                        ctx.validateParams();
                        if ([updatePolicies, addPolicies, intro, coverImages, tags].every(lodash_1.isUndefined)) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
                        }
                        if (!(0, lodash_1.isEmpty)(coverImages) && coverImages.some(function (x) { return !(0, validator_1.isURL)(x.toString(), { protocols: ['https'] }); })) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'));
                        }
                        this._policySchemaValidate(addPolicies, 'addPolicy');
                        this._policySchemaValidate(updatePolicies, 'updatePolicy');
                        return [4 /*yield*/, this.resourceService.findOne({ _id: resourceId })];
                    case 1:
                        resourceInfo = _a.sent();
                        ctx.entityNullValueAndUserAuthorizationCheck(resourceInfo, { msg: ctx.gettext('params-validate-failed', 'resourceId') });
                        updateResourceOptions = {
                            resourceId: resourceId,
                            intro: intro,
                            coverImages: coverImages,
                            tags: tags,
                            addPolicies: addPolicies,
                            updatePolicies: updatePolicies
                        };
                        return [4 /*yield*/, this.resourceService.updateResource(resourceInfo, updateResourceOptions).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.dependencyTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIdOrName, maxDeep, version, versionRange, omitFields, isContainRootNode, resourceInfo, resourceVersion, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
                        maxDeep = ctx.checkQuery('maxDeep').optional().isInt().toInt().ge(1).le(100).value;
                        version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
                        omitFields = ctx.checkQuery('omitFields').optional().toSplitArray()["default"]([]).value;
                        isContainRootNode = ctx.checkQuery('isContainRootNode').optional()["default"](false).toBoolean().value;
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
                        return [4 /*yield*/, this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, {
                                isContainRootNode: isContainRootNode,
                                maxDeep: maxDeep,
                                omitFields: omitFields
                            }).then(ctx.success)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.authTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIdOrName, version, versionRange, resourceInfo, resourceVersion, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
                        version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
                        versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
                        // const omitFields = ctx.checkQuery('omitFields').optional().toSplitArray().default([]).value;
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
                        return [4 /*yield*/, this.resourceService.getResourceAuthTree(versionInfo).then(ctx.success)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.relationTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIdOrName, version, versionRange, resourceInfo, resourceVersion, versionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
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
                        return [4 /*yield*/, this.resourceService.getRelationTree(versionInfo).then(ctx.success)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIdOrName, isLoadPolicyInfo, isLoadLatestVersionInfo, projection, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIdOrName = ctx.checkParams('resourceIdOrName').exist().decodeURIComponent().value;
                        isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt()["in"]([0, 1]).value;
                        isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt()["in"]([0, 1]).value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        resourceInfo = null;
                        if (!egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceIdOrName, projection.join(' '))];
                    case 1:
                        resourceInfo = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resourceService.findOneByResourceName(resourceIdOrName, projection.join(' '))];
                    case 3:
                        resourceInfo = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
                    case 5:
                        if (!(resourceInfo && isLoadLatestVersionInfo)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.resourceService.fillResourceLatestVersionInfo([resourceInfo]).then(lodash_1.first)];
                    case 6:
                        resourceInfo = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!(resourceInfo && isLoadPolicyInfo)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.resourceService.fillResourcePolicyInfo([resourceInfo]).then(lodash_1.first)];
                    case 8:
                        resourceInfo = _a.sent();
                        _a.label = 9;
                    case 9:
                        ctx.success(resourceInfo);
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.contractCoverageVersions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, contractId, condition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        contractId = ctx.checkParams('contractId').exist().isContractId().value;
                        ctx.validateParams();
                        condition = { resourceId: resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': contractId };
                        return [4 /*yield*/, this.resourceVersionService.find(condition, 'version versionId').then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceController.prototype.contractsCoverageVersions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, contractIds, condition, contractMap, dataList, _i, dataList_1, resourceVersion, _a, _b, resolveResource, _c, _d, contract, list, result, _e, contractMap_1, _f, key, value;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 200).value;
                        ctx.validateParams();
                        condition = { resourceId: resourceId, userId: ctx.userId, 'resolveResources.contracts.contractId': { $in: contractIds } };
                        contractMap = new Map(contractIds.map(function (x) { return [x, []]; }));
                        return [4 /*yield*/, this.resourceVersionService.find(condition, 'version versionId resolveResources.contracts.contractId')];
                    case 1:
                        dataList = _g.sent();
                        for (_i = 0, dataList_1 = dataList; _i < dataList_1.length; _i++) {
                            resourceVersion = dataList_1[_i];
                            for (_a = 0, _b = resourceVersion.resolveResources; _a < _b.length; _a++) {
                                resolveResource = _b[_a];
                                for (_c = 0, _d = resolveResource.contracts; _c < _d.length; _c++) {
                                    contract = _d[_c];
                                    list = contractMap.get(contract.contractId);
                                    list === null || list === void 0 ? void 0 : list.push((0, lodash_1.pick)(resourceVersion, ['version', 'versionId']));
                                }
                            }
                        }
                        result = [];
                        for (_e = 0, contractMap_1 = contractMap; _e < contractMap_1.length; _e++) {
                            _f = contractMap_1[_e], key = _f[0], value = _f[1];
                            result.push({ contractId: key, versions: (0, lodash_1.uniqBy)(value, 'versionId') });
                        }
                        ctx.success(result);
                        return [2 /*return*/];
                }
            });
        });
    };
    // 同一个资源下所有版本解决的子依赖(含上抛)列表以及对应的解决方式
    ResourceController.prototype.allResolveResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, resolveResourceMap, allResourceVersions, _i, allResourceVersions_1, resourceVersion, _a, _b, resourceResource, resourceId_1, resourceName, contracts;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        resolveResourceMap = new Map();
                        return [4 /*yield*/, this.resourceVersionService.find({ resourceId: resourceId }, 'version versionId resolveResources')];
                    case 1:
                        allResourceVersions = _c.sent();
                        for (_i = 0, allResourceVersions_1 = allResourceVersions; _i < allResourceVersions_1.length; _i++) {
                            resourceVersion = allResourceVersions_1[_i];
                            for (_a = 0, _b = resourceVersion.resolveResources; _a < _b.length; _a++) {
                                resourceResource = _b[_a];
                                resourceId_1 = resourceResource.resourceId, resourceName = resourceResource.resourceName, contracts = resourceResource.contracts;
                                if (!resolveResourceMap.has(resourceId_1)) {
                                    resolveResourceMap.set(resourceId_1, { resourceId: resourceId_1, resourceName: resourceName, versions: [] });
                                }
                                resolveResourceMap.get(resourceId_1).versions.push({
                                    version: resourceVersion.version, versionId: resourceVersion.versionId,
                                    contracts: contracts
                                });
                            }
                        }
                        ctx.success(__spreadArray([], resolveResourceMap.values(), true));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据sha1查询资料列表
     */
    ResourceController.prototype.resourceBySha1 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, fileSha1, projection, resourceVersions, resourceIds, resourceVersionIdSet, resources, _i, resources_1, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        fileSha1 = ctx.checkParams('fileSha1').exist().isSha1().toLowercase().value;
                        projection = ctx.checkQuery('projection').optional().toSplitArray()["default"]([]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceVersionService.find({ fileSha1: fileSha1 }, 'resourceId versionId')];
                    case 1:
                        resourceVersions = _a.sent();
                        resourceIds = resourceVersions.map(function (t) { return t.resourceId; });
                        if (!resourceIds.length) {
                            return [2 /*return*/, ctx.success([])];
                        }
                        resourceVersionIdSet = new Set(resourceVersions.map(function (x) { return x.versionId; }));
                        return [4 /*yield*/, this.resourceService.find({ _id: { $in: resourceIds } }, projection)];
                    case 2:
                        resources = _a.sent();
                        for (_i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                            resourceInfo = resources_1[_i];
                            if (resourceInfo.resourceVersions) {
                                resourceInfo.resourceVersions = resourceInfo.resourceVersions.filter(function (x) { return resourceVersionIdSet.has(x.versionId); });
                            }
                        }
                        ctx.success(resources);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 冻结资源
     */
    ResourceController.prototype.freezeResource = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, remark, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        remark = ctx.checkBody('remark').exist().len(1, 200).value;
                        ctx.validateParams().validateOfficialAuditAccount();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        if (!resourceInfo || [2, 3].includes(resourceInfo.status)) {
                            throw new egg_freelog_base_1.ArgumentError('未找到资源或资源已被冻结');
                        }
                        return [4 /*yield*/, this.resourceService.freezeOrDeArchiveResource(resourceInfo, remark).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解冻资源
     */
    ResourceController.prototype.deArchiveResource = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, resourceInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams().validateOfficialAuditAccount();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        if (!resourceInfo || [0, 1].includes(resourceInfo.status)) {
                            throw new egg_freelog_base_1.ArgumentError('未找到资源或资源不是冻结状态');
                        }
                        return [4 /*yield*/, this.resourceService.freezeOrDeArchiveResource(resourceInfo, '').then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 策略格式校验
     * @param policies
     * @param mode
     */
    ResourceController.prototype._policySchemaValidate = function (policies, mode) {
        var policyValidateResult = this.resourcePolicyValidator.validate(policies || [], mode);
        if (!(0, lodash_1.isEmpty)(policyValidateResult.errors)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-format-validate-failed', 'policies'), {
                errors: policyValidateResult.errors
            });
        }
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceController.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceController.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceController.prototype, "resourcePolicyValidator");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceController.prototype, "resourceVersionService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceController.prototype, "elasticSearchService");
    __decorate([
        (0, midway_1.get)('/_db_search')
    ], ResourceController.prototype, "index");
    __decorate([
        (0, midway_1.get)('/')
    ], ResourceController.prototype, "esSearch");
    __decorate([
        (0, midway_1.get)('/keywordSuggest')
    ], ResourceController.prototype, "keywordSuggest");
    __decorate([
        (0, midway_1.post)('/'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "create");
    __decorate([
        (0, midway_1.get)('/count'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "createdCount");
    __decorate([
        (0, midway_1.get)('/list')
    ], ResourceController.prototype, "list");
    __decorate([
        (0, midway_1.put)('/:resourceId'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "update");
    __decorate([
        (0, midway_1.get)('/:resourceIdOrName/dependencyTree'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceController.prototype, "dependencyTree");
    __decorate([
        (0, midway_1.get)('/:resourceIdOrName/authTree'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceController.prototype, "authTree");
    __decorate([
        (0, midway_1.get)('/:resourceIdOrName/relationTree'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceController.prototype, "relationTree");
    __decorate([
        (0, midway_1.get)('/:resourceIdOrName')
    ], ResourceController.prototype, "show");
    __decorate([
        (0, midway_1.get)('/:resourceId/contracts/:contractId/coverageVersions'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "contractCoverageVersions");
    __decorate([
        (0, midway_1.get)('/:resourceId/contracts/coverageVersions'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "contractsCoverageVersions");
    __decorate([
        (0, midway_1.get)('/:resourceId/resolveResources'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "allResolveResources");
    __decorate([
        (0, midway_1.get)('/files/:fileSha1'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "resourceBySha1");
    __decorate([
        (0, midway_1.put)('/:resourceId/freeze'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "freezeResource");
    __decorate([
        (0, midway_1.put)('/:resourceId/deArchive'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceController.prototype, "deArchiveResource");
    ResourceController = __decorate([
        (0, midway_1.provide)(),
        (0, midway_1.controller)('/v2/resources')
    ], ResourceController);
    return ResourceController;
}());
exports.ResourceController = ResourceController;
