import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base';

@provide()
@scope('Singleton')
export default class ResourceOperationProvider extends MongodbOperation<any> {
    constructor(@inject('model.ResourceOperation') model) {
        super(model);
    }
}
