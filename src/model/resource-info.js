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
exports.ResourceInfoModel = void 0;
var lodash_1 = require("lodash");
var midway_1 = require("midway");
var mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
var ResourceInfoModel = /** @class */ (function (_super) {
    __extends(ResourceInfoModel, _super);
    function ResourceInfoModel(mongoose) {
        return _super.call(this, mongoose) || this;
    }
    ResourceInfoModel_1 = ResourceInfoModel;
    ResourceInfoModel.prototype.buildMongooseModel = function () {
        var ResourceVersionSchema = new this.mongoose.Schema({
            version: { type: String, required: true },
            versionId: { type: String, required: true },
            createDate: { type: Date, required: true }
        }, { _id: false });
        var UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
        }, { _id: false });
        var PolicySchema = new this.mongoose.Schema({
            policyId: { type: String, required: true },
            policyName: { type: String, required: true },
            status: { type: Number, required: true }, // 0:不启用  1:启用
        }, { _id: false });
        var resourceInfoScheme = new this.mongoose.Schema({
            resourceName: { type: String, required: true },
            resourceType: { type: String, required: true },
            latestVersion: { type: String, "default": '', required: false },
            resourceVersions: { type: [ResourceVersionSchema], "default": [], required: false },
            userId: { type: Number, required: true },
            username: { type: String, required: true },
            resourceNameAbbreviation: { type: String, required: true },
            baseUpcastResources: { type: [UpcastResourceSchema], "default": [], required: false },
            intro: { type: String, required: false, "default": '' },
            coverImages: { type: [String], "default": [], required: false },
            tags: { type: [String], required: false, "default": [] },
            policies: { type: [PolicySchema], "default": [], required: false },
            uniqueKey: { type: String, unique: true, required: true },
            status: { type: Number, "default": 0, required: true }, // 0:下架 1:上架 2:冻结(下架) 3:冻结(上架)
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ResourceInfoModel_1.toObjectOptions,
            toObject: ResourceInfoModel_1.toObjectOptions
        });
        resourceInfoScheme.index({ resourceName: 1 }, { unique: true });
        resourceInfoScheme.index({ userId: 1, username: 1, resourceType: 1 });
        resourceInfoScheme.virtual('resourceId').get(function () {
            return this.id;
        });
        return this.mongoose.model('resource-infos', resourceInfoScheme);
    };
    Object.defineProperty(ResourceInfoModel, "toObjectOptions", {
        get: function () {
            return {
                getters: true,
                virtuals: true,
                transform: function (doc, ret) {
                    return (0, lodash_1.assign)({ resourceId: doc.id }, (0, lodash_1.omit)(ret, ['_id', 'id', 'resourceNameAbbreviation', 'uniqueKey']));
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    var ResourceInfoModel_1;
    ResourceInfoModel = ResourceInfoModel_1 = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('model.ResourceInfo'),
        __param(0, (0, midway_1.plugin)('mongoose'))
    ], ResourceInfoModel);
    return ResourceInfoModel;
}(mongoose_model_base_1.MongooseModelBase));
exports.ResourceInfoModel = ResourceInfoModel;
