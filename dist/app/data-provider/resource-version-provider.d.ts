import { MongodbOperation } from 'egg-freelog-base';
import { ResourceVersionInfo } from "../../interface";
export default class ResourceVersionProvider extends MongodbOperation<ResourceVersionInfo> {
    constructor(model: any);
}
