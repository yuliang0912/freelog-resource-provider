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
exports.ResourceTagController = void 0;
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var lodash_1 = require("lodash");
var freelog_common_func_1 = require("egg-freelog-base/lib/freelog-common-func");
var ResourceTagController = /** @class */ (function () {
    function ResourceTagController() {
    }
    /**
     * 创建资源tag
     */
    ResourceTagController.prototype.create = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, tagName, tagType, resourceRange, resourceRangeType, authority, invalidResourceTypes, tagInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        tagName = ctx.checkBody('tagName').exist().len(1, 50).trim().value;
                        tagType = ctx.checkBody('tagType').exist().toInt()["in"]([1, 2]).value;
                        resourceRange = ctx.checkBody('resourceRange').exist().isArray().len(0, 200).value;
                        resourceRangeType = ctx.checkBody('resourceRangeType').exist().toInt()["in"]([1, 2, 3]).value;
                        authority = ctx.checkBody('authority').exist().toInt()["in"]([1, 2, 3]).value;
                        ctx.validateParams().validateOfficialAuditAccount();
                        invalidResourceTypes = resourceRange.filter(function (x) { return !egg_freelog_base_1.CommonRegex.resourceType.test(x); });
                        if (!(0, lodash_1.isEmpty)(invalidResourceTypes)) {
                            throw new egg_freelog_base_1.ArgumentError('资源类型范围中存在无效的参数', { invalidResourceTypes: invalidResourceTypes });
                        }
                        tagInfo = {
                            tagName: tagName,
                            tagType: tagType,
                            resourceRange: resourceRange,
                            resourceRangeType: resourceRangeType,
                            authority: authority,
                            createUserId: this.ctx.userId
                        };
                        return [4 /*yield*/, this.resourceService.createResourceTag(tagInfo).then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建资源tag
     */
    ResourceTagController.prototype.updateTagInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, tagId, tagType, resourceRange, resourceRangeType, authority, tagInfo, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        tagId = ctx.checkParams('tagId').exist().isMongoObjectId().value;
                        tagType = ctx.checkBody('tagType').optional().toInt()["in"]([1, 2]).value;
                        resourceRange = ctx.checkBody('resourceRange').optional().isArray().len(0, 200).value;
                        resourceRangeType = ctx.checkBody('resourceRangeType').optional().toInt()["in"]([1, 2, 3]).value;
                        authority = ctx.checkBody('authority').optional().toInt()["in"]([1, 2, 3]).value;
                        ctx.validateParams().validateOfficialAuditAccount();
                        return [4 /*yield*/, this.resourceService.findResourceTags({ _id: tagId }).then(lodash_1.first)];
                    case 1:
                        tagInfo = _a.sent();
                        if (!tagInfo) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed'));
                        }
                        model = (0, freelog_common_func_1.deleteUndefinedFields)({
                            tagType: tagType,
                            resourceRangeType: resourceRangeType,
                            authority: authority
                        });
                        if (!(0, lodash_1.isEmpty)(resourceRange !== null && resourceRange !== void 0 ? resourceRange : [])) {
                            model.resourceRange = resourceRange;
                        }
                        if ((0, lodash_1.isEmpty)(Object.keys(model))) {
                            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-required-validate-failed'));
                        }
                        return [4 /*yield*/, this.resourceService.updateResourceTag(tagId, model)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 当前资源类型可用的tags
     */
    ResourceTagController.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ctx, resourceType, condition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx = this.ctx;
                        resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
                        ctx.validateParams();
                        condition = {
                            authority: 1,
                            $or: [{ resourceRangeType: 3 },
                                { resourceRangeType: 1, resourceRange: resourceType },
                                {
                                    resourceRangeType: 2,
                                    resourceRange: { $ne: resourceType }
                                }]
                        };
                        return [4 /*yield*/, this.resourceService.findResourceTags(condition, 'tagName tagType').then(ctx.success)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], ResourceTagController.prototype, "ctx");
    __decorate([
        (0, midway_1.inject)()
    ], ResourceTagController.prototype, "resourceService");
    __decorate([
        (0, midway_1.post)('/'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceTagController.prototype, "create");
    __decorate([
        (0, midway_1.post)('/:tagId'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceTagController.prototype, "updateTagInfo");
    __decorate([
        (0, midway_1.get)('/availableTags'),
        (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser)
    ], ResourceTagController.prototype, "list");
    ResourceTagController = __decorate([
        (0, midway_1.provide)(),
        (0, midway_1.priority)(10),
        (0, midway_1.controller)('/v2/resources/tags')
    ], ResourceTagController);
    return ResourceTagController;
}());
exports.ResourceTagController = ResourceTagController;
