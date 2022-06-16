import {inject, provide} from "midway";
import {IMongodbOperation} from "egg-freelog-base";
import {ResourceInfo} from "../../../interface";

@provide()
export class ApiResourceService {

    @inject()
    resourceProvider: IMongodbOperation<ResourceInfo>;

    async listByTagNameAndAfterCreateDate(params) {
        let startDate = new Date(params.startDate);
        let limitDate = new Date(params.limitDate);

        return this.resourceProvider.find({
            tags: {$elemMatch: {$eq: params.tagName}},
            $and: [
                {
                    createDate: {$gt: startDate}
                },
                {
                    createDate: {$lt: limitDate}
                }
            ],
        }, params.projection);
    }

    async listByResourceIds(params) {
        return this.resourceProvider.find({_id: {$in: params.resourceIds}}, params.projection);
    }
}
