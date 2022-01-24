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
exports.ResourceCollectionService = void 0;
var midway_1 = require("midway");
var lodash_1 = require("lodash");
var ResourceCollectionService = /** @class */ (function () {
    function ResourceCollectionService() {
    }
    ResourceCollectionService.prototype.collectionResource = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceCollectionProvider.findOneAndUpdate({
                        resourceId: model.resourceId, userId: model.userId
                    }, model, { "new": true }).then(function (collectionInfo) {
                        return collectionInfo || _this.resourceCollectionProvider.create(model);
                    })];
            });
        });
    };
    ResourceCollectionService.prototype.isCollected = function (resourceIds) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, collectedResourceSet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        condition = {
                            userId: this.ctx.userId, resourceId: { $in: resourceIds }
                        };
                        return [4 /*yield*/, this.resourceCollectionProvider.find(condition, 'resourceId')
                                .then(function (list) { return new Set(list.map(function (x) { return x.resourceId; })); })];
                    case 1:
                        collectedResourceSet = _a.sent();
                        return [2 /*return*/, resourceIds.map(function (resourceId) { return Object({ resourceId: resourceId, isCollected: collectedResourceSet.has(resourceId) }); })];
                }
            });
        });
    };
    ResourceCollectionService.prototype.find = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceCollectionProvider).find.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    ResourceCollectionService.prototype.findOne = function (condition) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.resourceCollectionProvider).findOne.apply(_a, __spreadArray([condition], args, false))];
            });
        });
    };
    ResourceCollectionService.prototype.deleteOne = function (condition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceCollectionProvider.deleteOne(condition).then(function (ret) { return ret.ok > 0; })];
            });
        });
    };
    ResourceCollectionService.prototype.count = function (condition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resourceCollectionProvider.count(condition)];
            });
        });
    };
    ResourceCollectionService.prototype.findIntervalList = function (resourceType, omitResourceType, keywords, resourceStatus, skip, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, searchRegExp, resourceMatchAggregates, collectionMatchAggregates, joinResourceAggregates, countAggregates, pageAggregates, countAggregatePipelines, resultAggregatePipelines, totalItemInfo, _a, totalItem, result, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        condition = { userId: this.ctx.userId };
                        if ((0, lodash_1.isString)(resourceType)) { // resourceType 与 omitResourceType互斥
                            condition.resourceType = new RegExp("^" + resourceType + "$", 'i');
                        }
                        else if ((0, lodash_1.isString)(omitResourceType)) {
                            condition.resourceType = { $ne: omitResourceType };
                        }
                        if ((0, lodash_1.isString)(keywords) && keywords.length > 0) {
                            searchRegExp = new RegExp(keywords, 'i');
                            if (/^[0-9a-fA-F]{4,24}$/.test(keywords)) {
                                condition.$or = [{ resourceName: searchRegExp }, { resourceId: keywords.toLowerCase() }];
                            }
                            else {
                                condition.resourceName = searchRegExp;
                            }
                        }
                        resourceMatchAggregates = [{
                                $match: {
                                    'resourceInfos.status': resourceStatus
                                }
                            }];
                        collectionMatchAggregates = [{
                                $match: condition
                            }];
                        joinResourceAggregates = [
                            {
                                $addFields: { resource_id: { $toObjectId: '$resourceId' } }
                            }, {
                                $lookup: {
                                    from: 'resource-infos',
                                    localField: 'resource_id',
                                    foreignField: '_id',
                                    as: 'resourceInfos'
                                }
                            }
                        ];
                        countAggregates = [{ $count: 'totalItem' }];
                        pageAggregates = [{
                                $skip: skip
                            }, {
                                $limit: limit
                            }];
                        if ([0, 1].includes(resourceStatus)) {
                            countAggregatePipelines = (0, lodash_1.flatten)([
                                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, countAggregates
                            ]);
                            resultAggregatePipelines = (0, lodash_1.flatten)([
                                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, pageAggregates
                            ]);
                        }
                        else {
                            countAggregatePipelines = (0, lodash_1.flatten)([
                                collectionMatchAggregates, joinResourceAggregates, countAggregates
                            ]);
                            resultAggregatePipelines = (0, lodash_1.flatten)([
                                collectionMatchAggregates, pageAggregates, joinResourceAggregates
                            ]);
                        }
                        return [4 /*yield*/, this.resourceCollectionProvider.aggregate(countAggregatePipelines)];
                    case 1:
                        totalItemInfo = (_c.sent())[0];
                        _a = (totalItemInfo || {}).totalItem, totalItem = _a === void 0 ? 0 : _a;
                        result = { skip: skip, limit: limit, totalItem: totalItem, dataList: [] };
                        if (totalItem <= skip) {
                            return [2 /*return*/, result];
                        }
                        _b = result;
                        return [4 /*yield*/, this.resourceCollectionProvider.aggregate(resultAggregatePipelines).then(function (list) { return list.map(function (model) {
                                var resourceId = model.resourceId, createDate = model.createDate, _a = model.resourceInfos, resourceInfos = _a === void 0 ? [] : _a;
                                var resourceInfo = resourceInfos.length ? resourceInfos[0] : {};
                                var resourceName = resourceInfo.resourceName, resourceType = resourceInfo.resourceType, userId = resourceInfo.userId, username = resourceInfo.username, coverImages = resourceInfo.coverImages, latestVersion = resourceInfo.latestVersion, resourceVersions = resourceInfo.resourceVersions, updateDate = resourceInfo.updateDate, status = resourceInfo.status;
                                return {
                                    resourceId: resourceId,
                                    resourceName: resourceName,
                                    resourceType: resourceType,
                                    coverImages: coverImages,
                                    resourceVersions: resourceVersions,
                                    latestVersion: latestVersion,
                                    authorId: userId,
                                    authorName: username,
                                    collectionDate: createDate,
                                    resourceStatus: status,
                                    resourceUpdateDate: updateDate,
                                };
                            }); })];
                    case 2:
                        _b.dataList = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceCollectionService.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceCollectionService.prototype, "resourceCollectionProvider");
    ResourceCollectionService = __decorate([
        (0, midway_1.provide)('resourceCollectionService')
    ], ResourceCollectionService);
    return ResourceCollectionService;
}());
exports.ResourceCollectionService = ResourceCollectionService;
