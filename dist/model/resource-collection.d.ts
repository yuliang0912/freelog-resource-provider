import { MongooseModelBase } from 'egg-freelog-base/database/mongoose-model-base';
export declare class ResourceCollectionModel extends MongooseModelBase {
    constructor(mongoose: any);
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        transform(doc: any, ret: any): Pick<any, string | number | symbol>;
    };
}
