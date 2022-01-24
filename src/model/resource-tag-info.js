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
exports.ResourceTagInfoModel = void 0;
var midway_1 = require("midway");
var mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
var lodash_1 = require("lodash");
var ResourceTagInfoModel = /** @class */ (function (_super) {
    __extends(ResourceTagInfoModel, _super);
    function ResourceTagInfoModel(mongoose) {
        return _super.call(this, mongoose) || this;
    }
    ResourceTagInfoModel_1 = ResourceTagInfoModel;
    ResourceTagInfoModel.prototype.buildMongooseModel = function () {
        // 后续产品的需求是tag不能由用户自由输入了,只能选择.前端用户可以选择分类标签. 后台可以选择全部
        var ResourceTagSchema = new this.mongoose.Schema({
            tagName: { type: String, required: true },
            tagType: { type: Number, required: true },
            authority: { type: Number, required: true },
            resourceRange: { type: [String], "default": [], required: false },
            resourceRangeType: { type: Number, "enum": [1, 2], required: true },
            createUserId: { type: Number, required: true },
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ResourceTagInfoModel_1.toJSONOptions
        });
        ResourceTagSchema.index({ tagName: 1 }, { unique: true });
        return this.mongoose.model('resource-tag-infos', ResourceTagSchema);
    };
    Object.defineProperty(ResourceTagInfoModel, "toJSONOptions", {
        get: function () {
            return {
                getters: true,
                virtuals: true,
                transform: function (doc, ret) {
                    return (0, lodash_1.assign)({ tagId: doc.id }, (0, lodash_1.omit)(ret, ['_id', 'id', 'createUserId']));
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    var ResourceTagInfoModel_1;
    ResourceTagInfoModel = ResourceTagInfoModel_1 = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('model.ResourceTagInfo'),
        __param(0, (0, midway_1.plugin)('mongoose'))
    ], ResourceTagInfoModel);
    return ResourceTagInfoModel;
}(mongoose_model_base_1.MongooseModelBase));
exports.ResourceTagInfoModel = ResourceTagInfoModel;
