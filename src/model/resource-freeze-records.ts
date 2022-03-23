import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceFreezeRecord')
export class ResourceFreezeRecordModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        const OperationRecordSchema = new this.mongoose.Schema({
            operatorUserId: {type: Number, required: true},
            operatorUserName: {type: String, required: true},
            type: {type: Number, enum: [1, 2], required: true}, // 1:冻结 2:解冻
            reason: {type: String, default: '', required: false}, // 冻结原因
            remark: {type: String, default: '', required: false} // 备注
        }, {
            _id: false,
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: false}
        });

        const ResourceFreezeRecordSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            records: {type: [OperationRecordSchema], required: true}
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
        });

        ResourceFreezeRecordSchema.index({resourceId: 1}, {unique: true});

        return this.mongoose.model('resource-freeze-records', ResourceFreezeRecordSchema);
    }

}
