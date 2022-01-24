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
exports.ResourceFilePropertyGenerator = void 0;
var midway_1 = require("midway");
var probe = require("probe-image-size");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceFilePropertyGenerator = /** @class */ (function () {
    function ResourceFilePropertyGenerator() {
        this.imagePropertyMap = new Map([['width', '宽度'], ['height', '高度'], ['type', '类型'], ['mime', 'mime']]);
    }
    /**
     * 获取资源文件属性
     * @param {{fileUrl: string; fileSize: number}} storageInfo
     * @param {string} resourceType
     * @returns {Promise<object[]>}
     */
    ResourceFilePropertyGenerator.prototype.getResourceFileProperty = function (storageInfo, resourceType) {
        return __awaiter(this, void 0, void 0, function () {
            var systemProperties;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        systemProperties = [];
                        if (!(resourceType.toLowerCase() === 'image')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getImageProperty(storageInfo.fileUrl)];
                    case 1:
                        systemProperties = _a.sent();
                        _a.label = 2;
                    case 2:
                        systemProperties.unshift({ name: '文件大小', key: 'fileSize', value: storageInfo.fileSize });
                        return [2 /*return*/, systemProperties];
                }
            });
        });
    };
    /**
     * 获取图片基础属性
     * @param fileUrl
     * @returns {Promise<object[]>}
     */
    ResourceFilePropertyGenerator.prototype.getImageProperty = function (fileUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var systemProperties, result, _i, _a, _b, key, value, name_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        systemProperties = [];
                        return [4 /*yield*/, probe(fileUrl)["catch"](function (error) {
                                throw new egg_freelog_base_1.ApplicationError('file is unrecognized image format');
                            })];
                    case 1:
                        result = _c.sent();
                        for (_i = 0, _a = Object.entries(result); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (this.imagePropertyMap.has(key)) {
                                name_1 = this.imagePropertyMap.get(key);
                                systemProperties.push({ name: name_1, key: key, value: value });
                            }
                        }
                        return [2 /*return*/, systemProperties];
                }
            });
        });
    };
    ResourceFilePropertyGenerator = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('resourceFilePropertyGenerator')
    ], ResourceFilePropertyGenerator);
    return ResourceFilePropertyGenerator;
}());
exports.ResourceFilePropertyGenerator = ResourceFilePropertyGenerator;
