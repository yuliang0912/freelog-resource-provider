import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceVersionDraft') // 此model可能考虑不要
export class ResourceVersionDraftModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: {type: String, required: true},
            defaultValue: {type: this.mongoose.Schema.Types.Mixed, required: true},
            type: {type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']}, // 类型目前分为: 可编辑文本框,不可编辑文本框,单选框,多选框,下拉选择框
            candidateItems: {type: [String], required: false}, // 选项列表
            remark: {type: String, required: false, default: ''}, // 对外显示的名称
        }, {_id: false});

        // 把依赖单独从systemMeta提取出来,是因为依赖作为一个通用的必备项,因为失去了就版本的资源实体.由版本作为主要的信息承载体
        const BaseDependencyScheme = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            versionRange: {type: String, required: true},
            versionRangeType: {type: Number, default: 1, enum: [1, 2], required: true}, // 1:选择的版本范围 2:输入的版本范围
        }, {_id: false});

        // 上抛的字段中不能包含versionRange,因为会存在多个依赖的重复共同上抛
        const UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
        }, {_id: false});

        const BaseContractInfo = new this.mongoose.Schema({
            policyId: {type: String, required: true}
        }, {_id: false});

        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            contracts: {type: [BaseContractInfo], required: true},
        }, {_id: false});

        const ResourceVersionDraftScheme = new this.mongoose.Schema({
            resourceId: {type: String, required: true}, // 存储ID,对应存储服务的file-storage
            version: {type: String, required: false, default: ''},
            userId: {type: Number, required: true},
            resourceType: {type: String, required: true},
            fileSha1: {type: String, required: false, default: ''},
            dependencies: {type: [BaseDependencyScheme], default: [], required: false},
            description: {type: String, default: '', required: false},
            upcastResources: {type: [UpcastResourceSchema], default: [], required: false},
            resolveResources: {type: [ResolveResourceSchema], default: [], required: false}, // 只有匹配到具体合同ID才算完成解决的承诺
            customPropertyDescriptors: {type: [CustomPropertyDescriptorScheme], default: [], required: false},
            status: {type: Number, default: 0, required: true},
        }, {
            minimize: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ResourceVersionDraftModel.toObjectOptions,
            toObject: ResourceVersionDraftModel.toObjectOptions
        });
        ResourceVersionDraftScheme.index({resourceId: 1}, {unique: true});

        return this.mongoose.model('resource-version-drafts', ResourceVersionDraftScheme);
    }

    static get toObjectOptions() {
        return {
            getters: true,
            transform(doc, ret) {
                return omit(ret, ['_id', 'id']);
            }
        };
    }
}
