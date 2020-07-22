"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResourceVersionDraftModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceVersionDraftModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ResourceVersionDraftModel = ResourceVersionDraftModel_1 = class ResourceVersionDraftModel extends mongoose_model_base_1.MongooseModelBase {
    buildMongooseModel() {
        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: { type: String, required: true },
            defaultValue: { type: this.mongoose.Schema.Types.Mixed, required: true },
            type: { type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select'] },
            candidateItems: { type: [String], required: false },
            remark: { type: String, required: false, default: '' },
        }, { _id: false });
        // 把依赖单独从systemMeta提取出来,是因为依赖作为一个通用的必备项,因为失去了就版本的资源实体.由版本作为主要的信息承载体
        const BaseDependencyScheme = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            versionRange: { type: String, required: true },
            versionRangeType: { type: Number, default: 1, enum: [1, 2], required: true },
        }, { _id: false });
        // 上抛的字段中不能包含versionRange,因为会存在多个依赖的重复共同上抛
        const UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
        }, { _id: false });
        const BaseContractInfo = new this.mongoose.Schema({
            policyId: { type: String, required: true }
        }, { _id: false });
        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            contracts: { type: [BaseContractInfo], required: true },
        }, { _id: false });
        const ResourceVersionDraftScheme = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            version: { type: String, required: false, default: '' },
            userId: { type: Number, required: true },
            resourceType: { type: String, required: true },
            fileSha1: { type: String, required: false, default: '' },
            dependencies: { type: [BaseDependencyScheme], default: [], required: false },
            description: { type: String, default: '', required: false },
            upcastResources: { type: [UpcastResourceSchema], default: [], required: false },
            resolveResources: { type: [ResolveResourceSchema], default: [], required: false },
            customPropertyDescriptors: { type: [CustomPropertyDescriptorScheme], default: [], required: false },
            status: { type: Number, default: 0, required: true },
        }, {
            minimize: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
            toJSON: ResourceVersionDraftModel_1.toObjectOptions,
            toObject: ResourceVersionDraftModel_1.toObjectOptions
        });
        ResourceVersionDraftScheme.index({ resourceId: 1 }, { unique: true });
        return this.mongoose.model('resource-version-drafts', ResourceVersionDraftScheme);
    }
    static get toObjectOptions() {
        return {
            getters: true,
            transform(doc, ret) {
                return lodash_1.omit(ret, ['_id', 'id']);
            }
        };
    }
};
ResourceVersionDraftModel = ResourceVersionDraftModel_1 = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('model.ResourceVersionDraft') // 此model可能考虑不要
], ResourceVersionDraftModel);
exports.ResourceVersionDraftModel = ResourceVersionDraftModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1kcmFmdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS12ZXJzaW9uLWRyYWZ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEI7QUFDNUIsbUNBQXNDO0FBQ3RDLCtEQUE0RTtBQUk1RSxJQUFhLHlCQUF5QixpQ0FBdEMsTUFBYSx5QkFBMEIsU0FBUSx1Q0FBaUI7SUFFNUQsa0JBQWtCO1FBRWQsdUNBQXVDO1FBQ3ZDLE1BQU0sOEJBQThCLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM1RCxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDbkMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUN0RSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFDO1lBQzNHLGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7WUFDakQsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUM7U0FDdkQsRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBRWpCLG1FQUFtRTtRQUNuRSxNQUFNLG9CQUFvQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDbEQsVUFBVSxFQUFF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