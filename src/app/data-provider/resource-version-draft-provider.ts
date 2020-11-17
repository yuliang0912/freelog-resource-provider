import {provide, inject, scope} from 'midway';
import {MongodbOperation} from 'egg-freelog-base'

@provide()
@scope('Singleton')
export default class ResourceVersionDraftProvider extends MongodbOperation<any> {
    constructor(@inject('model.ResourceVersionDraft') model) {
        super(model);
    }
}
