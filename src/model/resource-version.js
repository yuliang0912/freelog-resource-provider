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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.ResourceVersionModel = void 0;
var lodash_1 = require("lodash");
var midway_1 = require("midway");
var mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
var ResourceVersionModel = /** @class */ (function (_super) {
    __extends(ResourceVersionModel, _super);
    function ResourceVersionModel(mongoose) {
        return _super.call(this, mongoose) || this;
    }
    ResourceVersionModel_1 = ResourceVersionModel;
    ResourceVersionModel.prototype.buildMongooseModel = function () {
        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        var CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: { type: String, required: true },
            defaultValue: { type: this.mongoose.Schema.Types.Mixed, required: true },
            type: { type: String, required: true, "enum": ['editableText', 'readonlyText', 'radio', 'checkbox', 'select'] },
            candidateItems: { type: [String], required: false },
            remark: { type: String, required: false, "default": '' }, //备注,对外显示信息,例如字段说明或者用途信息等
        }, { _id: false });
        // 把依赖单独从systemMeta提取出来,是因为依赖作为一个通用的必备项,因为失去了就版本的资源实体.由版本作为主要的信息承载体
        var BaseDependencyScheme = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            versionRange: { type: String, required: true },
        }, { _id: false });
        // 上抛的字段中不能包含versionRange,因为会存在多个依赖的重复共同上抛
        var UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
        }, { _id: false });
        var BaseContractInfo = new this.mongoose.Schema({
            policyId: { type: String, required: true },
            contractId: { type: String, required: true },
        }, { _id: false });
        var ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            contracts: { type: [BaseContractInfo], required: true }, // 为保证数据完整性,必须匹配合约信息才能入库
        }, { _id: false });
        var resourceVersionScheme = new this.mongoose.Schema({
            versionId: { type: String, unique: true, required: true },
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            version: { type: String, required: true },
            userId: { type: Number, required: true },
            resourceType: { type: String, required: true },
            fileSha1: { type: String, required: true },
            filename: { type: String, required: true },
            dependencies: { type: [BaseDependencyScheme], required: false },
            description: { type: String, "default": '', required: false },
            upcastResources: { type: [UpcastResourceSchema], required: false },
            resolveResources: { type: [ResolveResourceSchema], required: false },
            systemProperty: { type: this.mongoose.Schema.Types.Mixed, "default": {}, required: true },
            customPropertyDescriptors: { type: [CustomPropertyDescriptorScheme], "default": [], required: false },
            status: { type: Number, "default": 0, required: true }, // 状态: 0:正常
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ResourceVersionModel_1.toObjectOptions,
            toObject: ResourceVersionModel_1.toObjectOptions
        });
        resourceVersionScheme.index({ versionId: 1 }, { unique: true });
        resourceVersionScheme.index({ resourceId: 1, version: 1 }, { unique: true });
        resourceVersionScheme.index({ fileSha1: 1, userId: 1 });
        resourceVersionScheme.virtual('customProperty').get(function () {
            if ((0, lodash_1.isUndefined)(this.customPropertyDescriptors) || !(0, lodash_1.isArray)(this.customPropertyDescriptors)) {
                return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
            }
            var customProperty = {};
            if (!(0, lodash_1.isEmpty)(this.customPropertyDescriptors)) {
                for (var _i = 0, _a = this.customPropertyDescriptors; _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b.key, defaultValue = _b.defaultValue;
                    customProperty[key] = defaultValue;
                }
            }
            return customProperty;
        });
        return this.mongoose.model('resource-versions', resourceVersionScheme);
    };
    Object.defineProperty(ResourceVersionModel, "toObjectOptions", {
        get: function () {
            return {
                getters: true,
                transform: function (doc, ret) {
                    return (0, lodash_1.omit)(ret, ['_id', 'id']);
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    var ResourceVersionModel_1;
    ResourceVersionModel = ResourceVersionModel_1 = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('model.ResourceVersion'),
        __param(0, (0, midway_1.plugin)('mongoose'))
    ], ResourceVersionModel);
    return ResourceVersionModel;
}(mongoose_model_base_1.MongooseModelBase));
exports.ResourceVersionModel = ResourceVersionModel;
