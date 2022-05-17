import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';
import {assign, omit} from 'lodash';

@scope('Singleton')
@provide('model.ResourceGroup')
export class ResourceGroupCatalogueModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        const BaseContractInfo = new this.mongoose.Schema({
            policyId: {type: String, required: true},
            contractId: {type: String, required: true},
        }, {_id: false});

        // 自定义属性描述器主要面向继承者,例如展品需要对资源中的自定义属性进行编辑
        const CustomPropertyDescriptorScheme = new this.mongoose.Schema({
            key: {type: String, required: true},
            defaultValue: {type: this.mongoose.Schema.Types.Mixed, required: true},
            type: {type: String, required: true, enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']}, // 类型目前分为: 可编辑文本框,不可编辑文本框,单选框,多选框,下拉选择框
            candidateItems: {type: [String], required: false}, // 选项列表
            remark: {type: String, required: false, default: ''}, //备注,对外显示信息,例如字段说明或者用途信息等
        }, {_id: false});

        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            contracts: {type: [BaseContractInfo], required: true}, // 为保证数据完整性,必须匹配合约信息才能入库
        }, {_id: false});

        const CatalogueNodeSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            versionRange: {type: String, required: true},
            resolveResources: {type: [ResolveResourceSchema], required: false}, // 只有匹配到具体合同ID才算完成解决的承诺
        }, {_id: false});

        // 组合资源必须解决掉子项的授权问题
        const CatalogueSchema = new this.mongoose.Schema({
            catalogueId: {type: String, required: true}, // 可以hash值获取前4位,保证同一个tree内部不冲突即可.
            catalogueName: {type: String, required: true}, // 目录名称
            catalogueType: {type: Number, required: true}, // 目录类型(1:目录 2:单品)
            sortId: {type: Number, required: true}, // 排序
            hierarchy: {type: Number, required: true}, // 层级
            resourceInfo: {type: CatalogueNodeSchema, default: null, required: true}, // 当目录是资源时,需要对应的资源实体
            parentId: {type: String, required: true, default: ''},
        }, {_id: false});

        // 可以把资源分组的目录数据理解为一个存放在OSS的文件
        const ResourceGroupCatalogueSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            userId: {type: Number, required: true},
            resourceType: {type: String, required: true},
            version: {type: String, required: true},
            versionId: {type: String, required: true},
            description: {type: String, default: '', required: false},
            systemProperty: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: true},  // 需要包含fileSize,文件具体的存储信息通过sha1值去存储服务获取
            customPropertyDescriptors: {type: [CustomPropertyDescriptorScheme], default: [], required: false},
            catalogues: {type: [CatalogueSchema], required: true}
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ResourceGroupCatalogueModel.toJSONOptions
        });

        ResourceGroupCatalogueSchema.index({resourceId: 1});
        ResourceGroupCatalogueSchema.index({versionId: 1}, {unique: true});

        return this.mongoose.model('resource-group-versions', ResourceGroupCatalogueSchema);
    }

    static get toJSONOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return assign({tagId: doc.id}, omit(ret, ['_id', 'id', 'createUserId']));
            }
        };
    }
}
