"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ResourceInfoModel = /** @class */ (() => {
    var ResourceInfoModel_1;
    let ResourceInfoModel = ResourceInfoModel_1 = class ResourceInfoModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const ResourceVersionSchema = new this.mongoose.Schema({
                version: { type: String, required: true },
                versionId: { type: String, unique: true, required: true },
                createDate: { type: Date, required: true }
            }, { _id: false });
            const UpcastResourceSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
            }, { _id: false });
            const PolicySchema = new this.mongoose.Schema({
                policyId: { type: String, required: true },
                policyName: { type: String, required: true },
                policyText: { type: String, required: true },
                status: { type: Number, required: true },
                authorizedObjects: [] // 授权对象
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
        midway_1.provide('model.ResourceInfo') // 此model可能考虑不要
    ], ResourceInfoModel);
    return ResourceInfoModel;
})();
exports.ResourceInfoModel = ResourceInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUFvQztBQUNwQyxtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsaUJBQWlCLHlCQUE5QixNQUFhLGlCQUFrQixTQUFRLHVDQUFpQjtRQUVwRCxrQkFBa0I7WUFFZCxNQUFNLHFCQUFxQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ25ELE9BQU8sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDdkMsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3ZELFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUMzQyxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFakIsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUMvQyxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFakIsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDMUMsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUN4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