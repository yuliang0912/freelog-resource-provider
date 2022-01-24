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
exports.ResourceCollectionController = void 0;
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceCollectionController = /** @class */ (function () {
    function ResourceCollectionController() {
    }
    ResourceCollectionController.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, skip, limit, resourceType, omitResourceType, keywords, resourceStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        skip = ctx.checkQuery('skip').optional().toInt()["default"](0).ge(0).value;
                        limit = ctx.checkQuery('limit').optional().toInt()["default"](10).gt(0).lt(101).value;
                        resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
                        omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
                        keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
                        resourceStatus = ctx.checkQuery('resourceStatus').optional().toInt()["in"]([0, 1, 2]).value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceCollectionService.findIntervalList(resourceType, omitResourceType, keywords, resourceStatus, skip, limit).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollectionController.prototype.create = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId, resourceInfo, collectionInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkBody('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceService.findByResourceId(resourceId)];
                    case 1:
                        resourceInfo = _a.sent();
                        ctx.entityNullObjectCheck(resourceInfo, {
                            msg: ctx.gettext('params-validate-failed', 'resourceId'),
                            data: { resourceId: resourceId }
                        });
                        collectionInfo = {
                            resourceId: resourceId,
                            resourceName: resourceInfo.resourceName,
                            resourceType: resourceInfo.resourceType,
                            authorId: resourceInfo.userId,
                            authorName: resourceInfo.username,
                            userId: ctx.userId
                        };
                        return [4 /*yield*/, this.resourceCollectionService.collectionResource(collectionInfo).then(ctx.success)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollectionController.prototype.isCollected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceIds = ctx.checkQuery('resourceIds').exist().isSplitMongoObjectId().toSplitArray().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceCollectionService.isCollected(resourceIds).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollectionController.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceCollectionService.findOne({
                                resourceId: resourceId,
                                userId: ctx.userId
                            }).then(ctx.success)["catch"](ctx.error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollectionController.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceCollectionService.deleteOne({
                                resourceId: resourceId,
                                userId: ctx.userId
                            }).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ResourceCollectionController.prototype.count = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
                        ctx.validateParams();
                        return [4 /*yield*/, this.resourceCollectionService.count({ resourceId: resourceId }).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceCollectionController.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceCollectionController.prototype, "resourceService");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceCollectionController.prototype, "resourceCollectionService");
    __decorate([
        (0, midway_1.get)('/'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceCollectionController.prototype, "index");
    __decorate([
        (0, midway_1.post)('/'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceCollectionController.prototype, "create");
    __decorate([
        (0, midway_1.get)('/isCollected'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser | egg_freelog_base_1.IdentityTypeEnum.InternalClient)
    ], ResourceCollectionController.prototype, "isCollected");
    __decorate([
        (0, midway_1.get)('/:resourceId'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceCollectionController.prototype, "show");
    __decorate([
        (0, midway_1.del)('/:resourceId'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceCollectionController.prototype, "destroy");
    __decorate([
        (0, midway_1.get)('/:resourceId/count'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceCollectionController.prototype, "count");
    ResourceCollectionController = __decorate([
        (0, midway_1.provide)(),
        (0, midway_1.controller)('/v2/collections/resources')
    ], ResourceCollectionController);
    return ResourceCollectionController;
}());
exports.ResourceCollectionController = ResourceCollectionController;
