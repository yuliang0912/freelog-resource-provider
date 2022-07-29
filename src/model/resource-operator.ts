import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceOperation')
export class ResourceOperationModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {
        // 资源运营相关通用存储
        const ResourceOperationSchema = new this.mongoose.Schema({
            type: {type: Number, required: true}, // 运营数据类型 (1:编辑精选)
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            resourceType: {type: [String], required: true},
            authorId: {type: Number, required: true},
            authorName: {type: String, default: ''},
            attachData: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: true},  // 附属数据
            createUserId: {type: Number, required: true}, // 数据创建者
            status: {type: Number, default: 0, required: true} // 0:正常
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
        });

        return this.mongoose.model('resource-operation-infos', ResourceOperationSchema);
    }
}
