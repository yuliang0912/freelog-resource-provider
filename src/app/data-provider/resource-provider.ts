import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base'
import {ResourceInfo} from '../../interface'

@provide()
@scope('Singleton')
export default class ResourceProvider extends MongodbOperation<ResourceInfo> {
    constructor(@inject('model.ResourceInfo') model) {
        super(model);
    }
}
