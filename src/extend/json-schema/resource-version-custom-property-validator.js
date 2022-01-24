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
exports.ResourceVersionCustomPropertyValidator = void 0;
var midway_1 = require("midway");
var egg_freelog_base_1 = require("egg-freelog-base");
/**
 * http://json-schema.org/understanding-json-schema/
 */
var ResourceVersionCustomPropertyValidator = /** @class */ (function (_super) {
    __extends(ResourceVersionCustomPropertyValidator, _super);
    function ResourceVersionCustomPropertyValidator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 资源自定义属性格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    ResourceVersionCustomPropertyValidator.prototype.validate = function (operations) {
        return _super.prototype.validate.call(this, operations, this.schemas['/customPropertySchema']);
    };
    /**
     * 注册所有的校验
     * @private
     */
    ResourceVersionCustomPropertyValidator.prototype.registerValidators = function () {
        _super.prototype.addSchema.call(this, {
            id: '/customPropertySchema',
            type: 'array',
            uniqueItems: true,
            maxItems: 30,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                properties: {
                    remark: { type: 'string', required: true, minLength: 0, maxLength: 50 },
                    key: {
                        type: 'string', required: true, minLength: 1, maxLength: 20,
                        pattern: '^[a-zA-Z0-9_]{1,20}$'
                    },
                    defaultValue: {
                        // 考虑到UI文本框输入,目前限定为字符串.后期可能修改为any
                        type: 'string', required: true, minLength: 0, maxLength: 140
                    },
                    type: {
                        type: 'string',
                        required: true,
                        "enum": ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']
                    },
                    candidateItems: {
                        type: 'array',
                        required: false,
                        uniqueItems: true,
                        maxItems: 30,
                        items: {
                            type: 'string', minLength: 1, maxLength: 500, required: true,
                        }
                    }
                }
            }
        });
    };
    __decorate([
        (0, midway_1.init)()
    ], ResourceVersionCustomPropertyValidator.prototype, "registerValidators");
    ResourceVersionCustomPropertyValidator = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('customPropertyValidator')
    ], ResourceVersionCustomPropertyValidator);
    return ResourceVersionCustomPropertyValidator;
}(egg_freelog_base_1.CommonJsonSchema));
exports.ResourceVersionCustomPropertyValidator = ResourceVersionCustomPropertyValidator;
