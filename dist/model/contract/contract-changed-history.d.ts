import { MongooseModelBase, IMongooseModelBase } from '../mongoose-model-base';
export declare class ContractChangedHistoryModel extends MongooseModelBase implements IMongooseModelBase {
    buildMongooseModel(): void;
    static get toObjectOptions(): {
        transform(doc: any, ret: any): {
            contractId: any;
        } & Pick<any, string | number | symbol>;
    };
}
