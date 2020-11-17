import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base'
import {ResourceVersionInfo} from "../../interface";

@provide()
@scope('Singleton')
export default class ResourceVersionProvider extends MongodbOperation<ResourceVersionInfo> {
    constructor(@inject('model.ResourceVersion') model) {
        super(model);
    }
}
