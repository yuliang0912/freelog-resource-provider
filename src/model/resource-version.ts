import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceVersion') // 此model可能考虑不要
export class ResourceVersionModel extends MongooseModelBase implements IMongooseModelBase {

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
        }, {_id: false});

        // 上抛的字段中不能包含versionRange,因为会存在多个依赖的重复共同上抛
        const UpcastResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
        }, {_id: false});

        const BaseContractInfo = new this.mongoose.Schema({
            policyId: {type: String, required: true},
            contractId: {type: String, required: true},
        }, {_id: false});

        // const SystemPropertyInfoSchema = new this.mongoose.Schema({
        //     name: {type: String, required: true}, // 对外显示的名称
        //     key: {type: String, required: true},
        //     value: {type: this.mongoose.Schema.Types.Mixed, required: true},
        // }, {_id: false});

        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            contracts: {type: [BaseContractInfo], required: true}, // 为保证数据完整性,必须匹配合约信息才能入库
        }, {_id: false});

        const resourceVersionScheme = new this.mongoose.Schema({
            versionId: {type: String, unique: true, required: true}, // 由resourceId和version通过算法计算获得
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            version: {type: String, required: true},
            userId: {type: Number, required: true},
            resourceType: {type: String, required: true},
            fileSha1: {type: String, required: true},
            filename: {type: String, required: true}, // 文件名称,用于下载时使用.会通过后缀分析
            dependencies: {type: [BaseDependencyScheme], required: false},
            description: {type: String, default: '', required: false},
            upcastResources: {type: [UpcastResourceSchema], required: false},
            resolveResources: {type: [ResolveResourceSchema], required: false}, // 只有匹配到具体合同ID才算完成解决的承诺
            systemProperty: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: true},  // 需要包含fileSize,文件具体的存储信息通过sha1值去存储服务获取
            customPropertyDescriptors: {type: [CustomPropertyDescriptorScheme], default: [], required: false},
            status: {type: Number, default: 0, required: true}, // 状态: 0:正常
        }, {
            minimize: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ResourceVersionModel.toObjectOptions,
            toObject: ResourceVersionModel.toObjectOptions
        });
        resourceVersionScheme.index({versionId: 1}, {unique: true});
        resourceVersionScheme.index({resourceId: 1, version: 1}, {unique: true});
        resourceVersionScheme.index({fileSha1: 1, userId: 1});

        resourceVersionScheme.virtual('customProperty').get(function (this: any) {
            if (this.customPropertyDescriptors === undefined) {
                return undefined; // 不查询customPropertyDescriptors时,不自动生成customProperty
            }
            let customProperty = {} as any;
            if (Array.isArray(this.customPropertyDescriptors) && this.customPropertyDescriptors.length) {
                this.customPropertyDescriptors.forEach(({key, defaultValue}) => {
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
                return omit(ret, ['_id', 'id']);
            }
        };
    }
}
