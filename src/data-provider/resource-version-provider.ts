import {provide, inject, scope} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
@scope('Singleton')
export default class ResourceVersionProvider extends MongoBaseOperation {
    constructor(@inject('model.ResourceVersionModel') bucketModel) {
        super(bucketModel);
    }
}
