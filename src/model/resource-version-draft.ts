import {omit} from 'lodash';
import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceVersionDraft')
export class ResourceVersionDraftModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        const ResourceVersionDraftScheme = new this.mongoose.Schema({
            resourceId: {type: String, required: true}, // 资源ID,每个资源只能有一个草稿信息,数据提交过来如果存在,则直接更新
            userId: {type: Number, required: true},
            resourceType: {type: [String], required: true},
            draftData: {type: this.mongoose.Schema.Types.Mixed, default: {}, required: false},
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
