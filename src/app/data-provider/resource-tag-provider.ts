import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class ResourceTagProvider extends MongodbOperation<any> {
    constructor(@inject('model.ResourceTagInfo') model) {
        super(model);
    }
}
