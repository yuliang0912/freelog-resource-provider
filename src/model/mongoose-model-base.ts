import {plugin} from 'midway';

export class MongooseModelBase implements IMongooseModelBase {

    protected mongoose;

    constructor(@plugin('mongoose') mongoose) {
        this.mongoose = mongoose;
        if (mongoose._readyState === 1) {
            return this.buildMongooseModel();
        } else {
            mongoose.reconnect();
            throw new Error('database connection error!');
        }
    }

    buildMongooseModel(...args): any {
        throw new Error('not implemented');
    }
}

export interface IMongooseModelBase {
    buildMongooseModel(...args): any;
}
