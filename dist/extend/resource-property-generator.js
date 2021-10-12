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
        return (0, mime_1.getType)(filename) ?? 'application/octet-stream';
    }
    /**
     * 生成资源版本ID
     * @param {string} resourceId
     * @param {string} version
     * @returns {string}
     */
    generateResourceVersionId(resourceId, version) {
        return egg_freelog_base_1.CryptoHelper.md5(`${resourceId}-${(0, semver_1.clean)(version)}`);
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
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('resourcePropertyGenerator')
], ResourcePropertyGenerator);
exports.ResourcePropertyGenerator = ResourcePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcHJvcGVydHktZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9yZXNvdXJjZS1wcm9wZXJ0eS1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTZCO0FBQzdCLG1DQUFzQztBQUN0Qyx1REFBOEM7QUFDOUMsK0JBQTZCO0FBSTdCLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBRWxDOzs7T0FHRztJQUNILG1CQUFtQixDQUFDLFFBQWdCO1FBQ2hDLE9BQU8sSUFBQSxjQUFPLEVBQUMsUUFBUSxDQUFDLElBQUksMEJBQTBCLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gseUJBQXlCLENBQUMsVUFBa0IsRUFBRSxPQUFlO1FBQ3pELE9BQU8sK0JBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLElBQUksSUFBQSxjQUFLLEVBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gseUJBQXlCLENBQUMsWUFBb0I7UUFDMUMsT0FBTywrQkFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUNKLENBQUE7QUE1QlkseUJBQXlCO0lBRnJDLElBQUEsY0FBSyxFQUFDLFdBQVcsQ0FBQztJQUNsQixJQUFBLGdCQUFPLEVBQUMsMkJBQTJCLENBQUM7R0FDeEIseUJBQXlCLENBNEJyQztBQTVCWSw4REFBeUIifQ==