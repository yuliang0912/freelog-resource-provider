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
exports.ResourcePolicyValidator = void 0;
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
var ResourcePolicyValidator = /** @class */ (function (_super) {
    __extends(ResourcePolicyValidator, _super);
    function ResourcePolicyValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 策略格式校验
     * @param operations
     * @param args
     */
    ResourcePolicyValidator.prototype.validate = function (operations) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var schemaId = args[0] === 'addPolicy' ? '/addPolicySchema' : '/updatePolicySchema';
        return _super.prototype.validate.call(this, operations, this.schemas[schemaId]);
    };
    /**
     * 注册所有的校验
     * @private
     */
    ResourcePolicyValidator.prototype.registerValidators = function () {
        /**
         * 策略名称格式
         * @param input
         * @returns {boolean}
         */
        _super.prototype.registerCustomFormats.call(this, 'policyName', function (input) {
            input = input.trim();
            return input.length >= 2 && input.length <= 20;
        });
        /**
         * 新增策略格式
         */
        _super.prototype.addSchema.call(this, {
            id: '/addPolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyName: { required: true, minLength: 2, maxLength: 20, type: 'string', format: 'policyName' },
                    policyText: { required: true, type: 'string' },
                    status: { required: false, type: 'integer', "enum": [0, 1], minimum: 0, maximum: 1 }
                }
            }
        });
        /**
         * 修改策略格式
         */
        _super.prototype.addSchema.call(this, {
            id: '/updatePolicySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 20,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    policyId: { required: true, type: 'string', format: 'md5' },
                    // 目前只允许修改上线下状态,名字暂时锁住不让修改
                    status: { required: true, type: 'integer', "enum": [0, 1], minimum: 0, maximum: 1 }
                }
            }
        });
    };
    __decorate([
        (0, midway_1.init)()
    ], ResourcePolicyValidator.prototype, "registerValidators");
    ResourcePolicyValidator = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('resourcePolicyValidator')
    ], ResourcePolicyValidator);
    return ResourcePolicyValidator;
}(egg_freelog_base_1.CommonJsonSchema));
exports.ResourcePolicyValidator = ResourcePolicyValidator;
