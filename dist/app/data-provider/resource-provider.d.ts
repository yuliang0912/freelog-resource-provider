import { MongodbOperation } from 'egg-freelog-base';
import { ResourceInfo } from '../../interface';
export default class ResourceProvider extends MongodbOperation<ResourceInfo> {
    constructor(model: any);
}
