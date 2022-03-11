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

        const ResolveResourceSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            contracts: {type: [BaseContractInfo], required: true}, // 为保证数据完整性,必须匹配合约信息才能入库
        }, {_id: false});

        // 组合资源必须解决掉子项的授权问题
        const CatalogueSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            versionRange: {type: String, required: true},
            resolveResources: {type: [ResolveResourceSchema], required: false}, // 只有匹配到具体合同ID才算完成解决的承诺
        }, {_id: false});

        // 可以把资源分组的目录数据理解为一个存放在OSS的文件.
        const ResourceGroupCatalogueSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            version: {type: String, required: true},
            versionId: {type: String, required: true},
            catalogues: {type: [CatalogueSchema], required: true},
            createUserId: {type: Number, required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ResourceGroupCatalogueModel.toJSONOptions
        });

        ResourceGroupCatalogueSchema.index({resourceId: 1});
        ResourceGroupCatalogueSchema.index({versionId: 1}, {unique: true});

        return this.mongoose.model('resource-group-catalogues', ResourceGroupCatalogueSchema);
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
