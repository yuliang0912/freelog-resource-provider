import {provide, inject, scope} from 'midway';
import * as MongoBaseOperation from 'egg-freelog-database/lib/database/mongo-base-operation';

@provide()
@scope('Singleton')
export default class ResourceProvider extends MongoBaseOperation {
    constructor(@inject('model.ResourceInfo') model) {
        super(model);
    }
}
