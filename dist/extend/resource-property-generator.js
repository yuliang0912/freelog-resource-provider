"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePropertyGenerator = void 0;
const semver_1 = require("semver");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const mime_1 = require("mime");
let ResourcePropertyGenerator = class ResourcePropertyGenerator {
    /**
     * 获取资源具体版本的mimeType.目前通过文件的后缀名分析获得.
     * @param filename
     */
    getResourceMimeType(filename) {
        return mime_1.getType(filename) ?? 'application/octet-stream';
    }
    /**
     * 生成资源版本ID
     * @param {string} resourceId
     * @param {string} version
     * @returns {string}
     */
    generateResourceVersionId(resourceId, version) {
        return egg_freelog_base_1.CryptoHelper.md5(`${resourceId}-${semver_1.clean(version)}`);
    }
    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateResourceUniqueKey(resourceName) {
        return egg_freelog_base_1.CryptoHelper.md5(`${resourceName.toLowerCase()}}`);
    }
};
ResourcePropertyGenerator = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('resourcePropertyGenerator')
], ResourcePropertyGenerator);
exports.ResourcePropertyGenerator = ResourcePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcHJvcGVydHktZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9yZXNvdXJjZS1wcm9wZXJ0eS1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTZCO0FBQzdCLG1DQUFzQztBQUN0Qyx1REFBOEM7QUFDOUMsK0JBQTZCO0FBSTdCLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBRWxDOzs7T0FHRztJQUNILG1CQUFtQixDQUFDLFFBQWdCO1FBQ2hDLE9BQU8sY0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLDBCQUEwQixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILHlCQUF5QixDQUFDLFVBQWtCLEVBQUUsT0FBZTtRQUN6RCxPQUFPLCtCQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxJQUFJLGNBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCx5QkFBeUIsQ0FBQyxZQUFvQjtRQUMxQyxPQUFPLCtCQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBQ0osQ0FBQTtBQTVCWSx5QkFBeUI7SUFGckMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDJCQUEyQixDQUFDO0dBQ3hCLHlCQUF5QixDQTRCckM7QUE1QlksOERBQXlCIn0=