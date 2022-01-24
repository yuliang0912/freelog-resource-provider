import { MongodbOperation } from 'egg-freelog-base';
import { CollectionResourceInfo } from '../../interface';
export default class ResourceCollectionProvider extends MongodbOperation<CollectionResourceInfo> {
    constructor(model: any);
}
