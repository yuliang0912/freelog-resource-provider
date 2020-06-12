import { MongooseModelBase, IMongooseModelBase } from './mongoose-model-base';
export declare class ResourceInfoModel extends MongooseModelBase implements IMongooseModelBase {
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            resourceId: any;
        } & Pick<any, string | number | symbol>;
    };
}
