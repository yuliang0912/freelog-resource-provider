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
var ResourceVersionModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceVersionModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ResourceVersionModel = ResourceVersionModel_1 = class ResourceVersionModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: { type: String, required: true },
            defaultValue: { type: this.mongoose.Schema.Types.Mixed, required: true },
            type: { type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select'] },
            candidateItems: { type: [String], required: false },
            remark: { type: String, required: false, default: '' }, //备注,对外显示信息,例如字段说明或者用途信息等
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
        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            contracts: { type: [BaseContractInfo], required: true }, // 为保证数据完整性,必须匹配合约信息才能入库
        }, { _id: false });
        const resourceVersionScheme = new this.mongoose.Schema({
            versionId: { type: String, unique: true, required: true },
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            version: { type: String, required: true },
            userId: { type: Number, required: true },
            resourceType: { type: String, required: true },
            fileSha1: { type: String, required: true },
            filename: { type: String, required: true },
            dependencies: { type: [BaseDependencyScheme], required: false },
            description: { type: String, default: '', required: false },
            upcastResources: { type: [UpcastResourceSchema], required: false },
            resolveResources: { type: [ResolveResourceSchema], required: false },
            systemProperty: { type: this.mongoose.Schema.Types.Mixed, default: {}, required: true },
            customPropertyDescriptors: { type: [CustomPropertyDescriptorScheme], default: [], required: false },
            status: { type: Number, default: 0, required: true }, // 状态: 0:正常
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
            if (lodash_1.isUndefined(this.customPropertyDescriptors) || !lodash_1.isArray(this.customPropertyDescriptors)) {
                return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
            }
            const customProperty = {};
            if (!lodash_1.isEmpty(this.customPropertyDescriptors)) {
                for (const { key, defaultValue } of this.customPropertyDescriptors) {
                    customProperty[key] = defaultValue;
                }
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
    midway_1.provide('model.ResourceVersion'),
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], ResourceVersionModel);
exports.ResourceVersionModel = ResourceVersionModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBMkQ7QUFDM0QsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLG9CQUFvQiw0QkFBakMsTUFBYSxvQkFBcUIsU0FBUSx1Q0FBaUI7SUFFdkQsWUFBZ0MsUUFBUTtRQUNwQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELGtCQUFrQjtRQUVkLHVDQUF1QztRQUN2QyxNQUFNLDhCQUE4QixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDNUQsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ25DLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDdEUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBQztZQUMzRyxjQUFjLEVBQUUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO1lBQ2pELE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDLEVBQUUseUJBQXlCO1NBQ2xGLEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUVqQixtRUFBbUU7UUFDbkUsTUFB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