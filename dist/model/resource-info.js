"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ResourceInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ResourceInfoModel = ResourceInfoModel_1 = class ResourceInfoModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const ResourceVersionSchema = new this.mongoose.Schema({
            version: { type: String, required: true },
            versionId: { type: String, required: true },
            createDate: { type: Date, required: true }
        }, { _id: false });
        const UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
        }, { _id: false });
        const PolicySchema = new this.mongoose.Schema({
            policyId: { type: String, required: true },
            policyName: { type: String, required: true },
            status: { type: Number, required: true },
        }, { _id: false });
        const resourceInfoScheme = new this.mongoose.Schema({
            resourceName: { type: String, required: true },
            resourceType: { type: String, required: true },
            latestVersion: { type: String, default: '', required: false },
            resourceVersions: { type: [ResourceVersionSchema], default: [], required: false },
            userId: { type: Number, required: true },
            username: { type: String, required: true },
            baseUpcastResources: { type: [UpcastResourceSchema], default: [], required: false },
            intro: { type: String, required: false, default: '' },
            coverImages: { type: [String], default: [], required: false },
            tags: { type: [String], required: false, default: [] },
            policies: { type: [PolicySchema], default: [], required: false },
            uniqueKey: { type: String, unique: true, required: true },
            status: { type: Number, default: 0, required: true },
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
    }
    static get toObjectOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return lodash_1.assign({ resourceId: doc.id }, lodash_1.omit(ret, ['_id', 'id', 'uniqueKey']));
            }
        };
    }
};
ResourceInfoModel = ResourceInfoModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ResourceInfo'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ResourceInfoModel);
exports.ResourceInfoModel = ResourceInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBb0M7QUFDcEMsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLGlCQUFpQix5QkFBOUIsTUFBYSxpQkFBa0IsU0FBUSx1Q0FBaUI7SUFFcEQsWUFBZ0MsUUFBUTtRQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELGtCQUFrQjtRQUNkLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNuRCxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDdkMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ3pDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztTQUMzQyxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFFakIsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ2xELFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMxQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7U0FDL0MsRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDMUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1B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