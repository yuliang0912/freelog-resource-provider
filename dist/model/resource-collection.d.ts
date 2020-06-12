import { MongooseModelBase, IMongooseModelBase } from './mongoose-model-base';
export declare class ResourceCollectionModel extends MongooseModelBase implements IMongooseModelBase {
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        transform(doc: any, ret: any): Pick<any, string | number | symbol>;
    };
}
