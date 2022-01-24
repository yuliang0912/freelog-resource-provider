/// <reference types="lodash" />
import { MongooseModelBase } from 'egg-freelog-base/database/mongoose-model-base';
export declare class ResourceTagInfoModel extends MongooseModelBase {
    constructor(mongoose: any);
    buildMongooseModel(): any;
    static get toJSONOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            tagId: any;
        } & import("lodash").Omit<any, "id" | "_id" | "createUserId">;
    };
}
