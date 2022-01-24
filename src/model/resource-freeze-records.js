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
exports.ResourceFreezeRecordModel = void 0;
var midway_1 = require("midway");
var mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
var ResourceFreezeRecordModel = /** @class */ (function (_super) {
    __extends(ResourceFreezeRecordModel, _super);
    function ResourceFreezeRecordModel(mongoose) {
        return _super.call(this, mongoose) || this;
    }
    ResourceFreezeRecordModel.prototype.buildMongooseModel = function () {
        var OperationRecordSchema = new this.mongoose.Schema({
            operatorUserId: { type: Number, required: true },
            operatorUserName: { type: String, required: true },
            type: { type: Number, "enum": [1, 2], required: true },
            remark: { type: String, "default": '', required: false }
        }, {
            _id: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: false }
        });
        var ResourceFreezeRecordSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            records: { type: [OperationRecordSchema], required: true }
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' }
        });
        ResourceFreezeRecordSchema.index({ resourceId: 1 }, { unique: true });
        return this.mongoose.model('resource-freeze-records', ResourceFreezeRecordSchema);
    };
    ResourceFreezeRecordModel = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('model.ResourceFreezeRecord'),
        __param(0, (0, midway_1.plugin)('mongoose'))
    ], ResourceFreezeRecordModel);
    return ResourceFreezeRecordModel;
}(mongoose_model_base_1.MongooseModelBase));
exports.ResourceFreezeRecordModel = ResourceFreezeRecordModel;
