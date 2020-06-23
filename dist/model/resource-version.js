"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceVersionModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ResourceVersionModel = /** @class */ (() => {
    var ResourceVersionModel_1;
    let ResourceVersionModel = ResourceVersionModel_1 = class ResourceVersionModel extends mongoose_model_base_1.MongooseModelBase {
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
            }, { _id: false });
            // 上抛的字段中不能包含versionRange,因为会存在多个依赖的重复共同上抛
            const UpcastResourceSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
            }, { _id: false });
            const BaseContractInfo = new this.mongoose.Schema({
                policyId: { type: String, required: true },
                contractId: { type: String, required: true },
            }, { _id: false });
            // const SystemPropertyInfoSchema = new this.mongoose.Schema({
            //     name: {type: String, required: true}, // 对外显示的名称
            //     key: {type: String, required: true},
            //     value: {type: this.mongoose.Schema.Types.Mixed, required: true},
            // }, {_id: false});
            const ResolveResourceSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                contracts: { type: [BaseContractInfo], required: true },
            }, { _id: false });
            const resourceVersionScheme = new this.mongoose.Schema({
                versionId: { type: String, unique: true, required: true },
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                version: { type: String, required: true },
                userId: { type: Number, required: true },
                resourceType: { type: String, required: true },
                fileSha1: { type: String, required: true },
                dependencies: { type: [BaseDependencyScheme], required: false },
                description: { type: String, default: '', required: false },
                upcastResources: { type: [UpcastResourceSchema], required: false },
                resolveResources: { type: [ResolveResourceSchema], required: false },
                systemProperty: { type: this.mongoose.Schema.Types.Mixed, default: {}, required: true },
                customPropertyDescriptors: { type: [CustomPropertyDescriptorScheme], default: [], required: false },
                status: { type: Number, default: 0, required: true },
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
                if (this.customPropertyDescriptors === undefined) {
                    return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
                }
                let customProperty = {};
                if (Array.isArray(this.customPropertyDescriptors) && this.customPropertyDescriptors.length) {
                    this.customPropertyDescriptors.forEach(({ key, defaultValue }) => {
                        customProperty[key] = defaultValue;
                    });
                }
                return customProperty;
            });
            return this.mongoose.model('resource-versions', resourceVersionScheme);
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
    ResourceVersionModel = ResourceVersionModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ResourceVersion') // 此model可能考虑不要
    ], ResourceVersionModel);
    return ResourceVersionModel;
})();
exports.ResourceVersionModel = ResourceVersionModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsb0JBQW9CLDRCQUFqQyxNQUFhLG9CQUFxQixTQUFRLHVDQUFpQjtRQUV2RCxrQkFBa0I7WUFFZCx1Q0FBdUM7WUFDdkMsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM1RCxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ25DLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3RFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUM7Z0JBQzNHLGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUM7Z0JBQ2pELE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO2FBQ3ZELEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUVqQixtRUFBbUU7WUFDbkUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxVQUFVLEVBQUUs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