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
exports.OutsideApiService = void 0;
var midway_1 = require("midway");
var lodash_1 = require("lodash");
var egg_freelog_base_1 = require("egg-freelog-base");
var OutsideApiService = /** @class */ (function () {
    function OutsideApiService() {
    }
    /**
     * 获取文件流
     * @param fileSha1
     */
    OutsideApiService.prototype.getFileStream = function (fileSha1) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.ctx.curlIntranetApi(this.ctx.webApi.storageInfo + "/files/" + fileSha1 + "/download", null, egg_freelog_base_1.CurlResFormatEnum.Original)];
            });
        });
    };
    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     * @param resourceType
     */
    OutsideApiService.prototype.getFileObjectProperty = function (fileSha1, resourceType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.ctx.curlIntranetApi(this.ctx.webApi.storageInfo + "/files/" + fileSha1 + "/property?resourceType=" + resourceType)];
            });
        });
    };
    /**
     * 批量签约(已经签过不会重签,合约服务会自动过滤)
     * @param licenseeResourceId
     * @param subjects
     */
    OutsideApiService.prototype.batchSignResourceContracts = function (licenseeResourceId, subjects) {
        return __awaiter(this, void 0, void 0, function () {
            var postBody;
            return __generator(this, function (_a) {
                postBody = {
                    subjectType: egg_freelog_base_1.SubjectTypeEnum.Resource,
                    licenseeIdentityType: egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource,
                    licenseeId: licenseeResourceId,
                    subjects: subjects
                };
                return [2 /*return*/, this.ctx.curlIntranetApi(this.ctx.webApi.contractInfoV2 + "/batchSign", {
                        method: 'post', contentType: 'json', data: postBody
                    })];
            });
        });
    };
    /**
     * 批量创建策略
     * @param policyTexts
     */
    OutsideApiService.prototype.createPolicies = function (policyTexts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.ctx.curlIntranetApi("" + this.ctx.webApi.policyInfoV2, {
                        method: 'post', contentType: 'json', data: {
                            policyTexts: policyTexts,
                            subjectType: egg_freelog_base_1.SubjectTypeEnum.Resource
                        }
                    })];
            });
        });
    };
    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    OutsideApiService.prototype.getResourcePolicies = function (policyIds, projection) {
        if (projection === void 0) { projection = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.ctx.curlIntranetApi(this.ctx.webApi.policyInfoV2 + "/list?policyIds=" + policyIds.toString() + "&subjectType=" + egg_freelog_base_1.SubjectTypeEnum.Resource + "&projection=" + projection.toString())];
            });
        });
    };
    /**
     * 获取资源合约
     * @param contractIds
     * @param options
     */
    OutsideApiService.prototype.getContractByContractIds = function (contractIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var optionParams, tasks;
            var _this = this;
            return __generator(this, function (_a) {
                optionParams = options ? Object.entries(options).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return key + "=" + value;
                }) : [];
                tasks = (0, lodash_1.chunk)((0, lodash_1.uniq)(contractIds), 100).map(function (contractIdChunk) {
                    return _this.ctx.curlIntranetApi(_this.ctx.webApi.contractInfoV2 + "/list?contractIds=" + contractIds.toString() + "&" + optionParams.join('&'));
                });
                return [2 /*return*/, Promise.all(tasks).then(function (results) { return (0, lodash_1.flatten)(results); })];
            });
        });
    };
    /**
     * 获取指定乙方与甲方的资源合约
     * @param subjectId (资源体系中标的物ID与甲方ID均为资源ID)
     * @param licenseeId
     * @param options
     */
    OutsideApiService.prototype.getResourceContracts = function (subjectId, licenseeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var optionParams;
            return __generator(this, function (_a) {
                optionParams = options ? Object.entries(options).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return key + "=" + value;
                }) : [];
                return [2 /*return*/, this.ctx.curlIntranetApi(this.ctx.webApi.contractInfoV2 + "?identityType=2&subjectId=" + subjectId + "&licenseeId=" + licenseeId + "&subjectType=" + egg_freelog_base_1.SubjectTypeEnum.Resource + "&" + optionParams.join('&'))];
            });
        });
    };
    __decorate([
        (0, midway_1.inject)()
    ], OutsideApiService.prototype, "ctx");
    OutsideApiService = __decorate([
        (0, midway_1.provide)()
    ], OutsideApiService);
    return OutsideApiService;
}());
exports.OutsideApiService = OutsideApiService;
