import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceVersionDraft') // 此model可能考虑不要
export class ResourceVersionDraftModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        const ResourceVersionDraftScheme = new this.mongoose.Schema({
            resourceId: {type: String, required: true}, // 存储ID,对应存储服务的file-storage
            userId: {type: Number, required: true},
            resourceType: {type: String, required: true},
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
