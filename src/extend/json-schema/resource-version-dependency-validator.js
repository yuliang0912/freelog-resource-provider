"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ResourceVersionDependencyValidator = void 0;
var semver = require("semver");
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourceVersionDependencyValidator = /** @class */ (function (_super) {
    __extends(ResourceVersionDependencyValidator, _super);
    function ResourceVersionDependencyValidator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resourceIdSet = new Set();
        return _this;
    }
    /**
     * 依赖资源格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    ResourceVersionDependencyValidator.prototype.validate = function (operations) {
        this.resourceIdSet.clear();
        return _super.prototype.validate.call(this, operations, this.schemas['/resourceDependencySchema']);
    };
    /**
     * 注册所有的校验
     * @private
     */
    ResourceVersionDependencyValidator.prototype.registerValidators = function () {
        _super.prototype.registerCustomFormats.call(this, 'versionRange', function (input) {
            input = input.trim();
            return semver.validRange(input);
        });
        _super.prototype.addSchema.call(this, {
            id: '/resourceDependencySchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    resourceId: { type: 'string', required: true, format: 'mongoObjectId' },
                    versionRange: { type: 'string', required: true, format: 'versionRange' },
                    // versionRangeType: {type: 'integer', required: false, enum: [1, 2]},
                }
            }
        });
    };
    __decorate([
        (0, midway_1.init)()
    ], ResourceVersionDependencyValidator.prototype, "registerValidators");
    ResourceVersionDependencyValidator = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('resourceVersionDependencyValidator')
    ], ResourceVersionDependencyValidator);
    return ResourceVersionDependencyValidator;
}(egg_freelog_base_1.CommonJsonSchema));
exports.ResourceVersionDependencyValidator = ResourceVersionDependencyValidator;
