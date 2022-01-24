"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ResourcePropertyGenerator = void 0;
var semver_1 = require("semver");
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var mime_1 = require("mime");
var ResourcePropertyGenerator = /** @class */ (function () {
    function ResourcePropertyGenerator() {
    }
    /**
     * 获取资源具体版本的mimeType.目前通过文件的后缀名分析获得.
     * @param filename
     */
    ResourcePropertyGenerator.prototype.getResourceMimeType = function (filename) {
        var _a;
        return (_a = (0, mime_1.getType)(filename)) !== null && _a !== void 0 ? _a : 'application/octet-stream';
    };
    /**
     * 生成资源版本ID
     * @param {string} resourceId
     * @param {string} version
     * @returns {string}
     */
    ResourcePropertyGenerator.prototype.generateResourceVersionId = function (resourceId, version) {
        return egg_freelog_base_1.CryptoHelper.md5(resourceId + "-" + (0, semver_1.clean)(version));
    };
    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    ResourcePropertyGenerator.prototype.generateResourceUniqueKey = function (resourceName) {
        return egg_freelog_base_1.CryptoHelper.md5(resourceName.toLowerCase() + "}");
    };
    ResourcePropertyGenerator = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('resourcePropertyGenerator')
    ], ResourcePropertyGenerator);
    return ResourcePropertyGenerator;
}());
exports.ResourcePropertyGenerator = ResourcePropertyGenerator;
