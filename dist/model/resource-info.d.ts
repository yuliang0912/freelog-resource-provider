/// <reference types="lodash" />
import { MongooseModelBase } from 'egg-freelog-base/database/mongoose-model-base';
export declare class ResourceInfoModel extends MongooseModelBase {
    constructor(mongoose: any);
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            resourceId: any;
        } & import("lodash").Omit<any, "id" | "_id" | "uniqueKey" | "resourceNameAbbreviation">;
    };
}
