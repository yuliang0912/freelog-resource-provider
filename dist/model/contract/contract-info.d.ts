import { MongooseModelBase, IMongooseModelBase } from '../mongoose-model-base';
export declare class ContractInfoModel extends MongooseModelBase implements IMongooseModelBase {
    buildMongooseModel(): void;
    static get toObjectOptions(): {
        getters: boolean;
        virtuals: boolean;
        transform(doc: any, ret: any): {
            contractId: any;
        } & Pick<any, string | number | symbol>;
    };
}
