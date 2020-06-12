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
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
let ResourcePropertyGenerator = /** @class */ (() => {
    let ResourcePropertyGenerator = class ResourcePropertyGenerator {
        /**
         * 生成资源版本ID
         * @param {string} resourceId
         * @param {string} version
         * @returns {string}
         */
        generateResourceVersionId(resourceId, version) {
            return crypto_helper_1.md5(`${resourceId}-${semver_1.clean(version)}`);
        }
        /**
         * 生成资源唯一key
         * @param {string} resourceName
         * @returns {string}
         */
        generateResourceUniqueKey(resourceName) {
            return crypto_helper_1.md5(`${resourceName.toLowerCase()}}`);
        }
    };
    ResourcePropertyGenerator = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('resourcePropertyGenerator')
    ], ResourcePropertyGenerator);
    return ResourcePropertyGenerator;
})();
exports.ResourcePropertyGenerator = ResourcePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcHJvcGVydHktZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9yZXNvdXJjZS1wcm9wZXJ0eS1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQTZCO0FBQzdCLG1DQUFzQztBQUN0QyxvRkFBcUU7QUFJckU7SUFBQSxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtRQUVsQzs7Ozs7V0FLRztRQUNILHlCQUF5QixDQUFDLFVBQWtCLEVBQUUsT0FBZTtZQUN6RCxPQUFPLG1CQUFHLENBQUMsR0FBRyxVQUFVLElBQUksY0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILHlCQUF5QixDQUFDLFlBQW9CO1lBQzFDLE9BQU8sbUJBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUNKLENBQUE7SUFwQlkseUJBQXlCO1FBRnJDLGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQywyQkFBMkIsQ0FBQztPQUN4Qix5QkFBeUIsQ0FvQnJDO0lBQUQsZ0NBQUM7S0FBQTtBQXBCWSw4REFBeUIifQ==