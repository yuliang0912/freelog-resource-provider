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
exports.ResourceVersionDraftModel = void 0;
var lodash_1 = require("lodash");
var midway_1 = require("midway");
var mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
var ResourceVersionDraftModel = /** @class */ (function (_super) {
    __extends(ResourceVersionDraftModel, _super);
    function ResourceVersionDraftModel(mongoose) {
        return _super.call(this, mongoose) || this;
    }
    ResourceVersionDraftModel_1 = ResourceVersionDraftModel;
    ResourceVersionDraftModel.prototype.buildMongooseModel = function () {
        var ResourceVersionDraftScheme = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            userId: { type: Number, required: true },
            resourceType: { type: String, required: true },
            draftData: { type: this.mongoose.Schema.Types.Mixed, "default": {}, required: false },
            status: { type: Number, "default": 0, required: true },
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ResourceVersionDraftModel_1.toObjectOptions,
            toObject: ResourceVersionDraftModel_1.toObjectOptions
        });
        ResourceVersionDraftScheme.index({ resourceId: 1 }, { unique: true });
        return this.mongoose.model('resource-version-drafts', ResourceVersionDraftScheme);
    };
    Object.defineProperty(ResourceVersionDraftModel, "toObjectOptions", {
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
    var ResourceVersionDraftModel_1;
    ResourceVersionDraftModel = ResourceVersionDraftModel_1 = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('model.ResourceVersionDraft'),
        __param(0, (0, midway_1.plugin)('mongoose'))
    ], ResourceVersionDraftModel);
    return ResourceVersionDraftModel;
}(mongoose_model_base_1.MongooseModelBase));
exports.ResourceVersionDraftModel = ResourceVersionDraftModel;
