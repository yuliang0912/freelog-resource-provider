import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base'
import {CollectionResourceInfo} from '../../interface'

@provide()
@scope('Singleton')
export default class ResourceCollectionProvider extends MongodbOperation<CollectionResourceInfo> {
    constructor(@inject('model.ResourceCollection') model) {
        super(model);
    }
}
