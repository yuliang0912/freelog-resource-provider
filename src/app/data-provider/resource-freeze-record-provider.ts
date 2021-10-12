import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class ResourceFreezeRecordProvider extends MongodbOperation<any> {
    constructor(@inject('model.ResourceFreezeRecord') model) {
        super(model);
    }
}
