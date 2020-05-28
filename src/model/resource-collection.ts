import {omit} from 'lodash';
import {scope, provide} from 'midway';
import {MongooseModelBase, IMongooseModelBase} from './mongoose-model-base';

@scope('Singleton')
@provide('model.ResourceCollectionModel') // 此model可能考虑不要
export class ResourceCollectionModel extends MongooseModelBase implements IMongooseModelBase {

    buildMongooseModel() {

        const CollectionSchema = new this.mongoose.Schema({
            resourceId: {type: String, required: true},
            resourceName: {type: String, required: true},
            resourceType: {type: String, required: true},
            authorId: {type: Number, required: true},
            authorName: {type: String, default: ''},
            userId: {type: Number, required: true},
            status: {type: Number, default: 0, required: true} // 0:正常
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate'},
            toJSON: ResourceCollectionModel.toObjectOptions,
            toObject: ResourceCollectionModel.toObjectOptions
        });

        CollectionSchema.index({resourceId: 1, userId: 1}, {unique: true});

        return this.mongoose.model('resource-collections', CollectionSchema);
    }

    static get toObjectOptions() {
        return {
            transform(doc, ret) {
                return omit(ret, ['_id']);
            }
        };
    }
}
