export declare class MongooseModelBase implements IMongooseModelBase {
    protected mongoose: any;
    protected uploadConfig: any;
    constructor(mongoose: any);
    buildMongooseModel(...args: any[]): any;
}
export interface IMongooseModelBase {
    buildMongooseModel(...args: any[]): any;
}
