export declare class MongooseModelBase implements IMongooseModelBase {
    protected mongoose: any;
    constructor(mongoose: any);
    buildMongooseModel(...args: any[]): any;
}
export interface IMongooseModelBase {
    buildMongooseModel(...args: any[]): any;
}
