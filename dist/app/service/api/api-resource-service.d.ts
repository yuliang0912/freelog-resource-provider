import { IMongodbOperation } from "egg-freelog-base";
import { ResourceInfo } from "../../../interface";
export declare class ApiResourceService {
    resourceProvider: IMongodbOperation<ResourceInfo>;
    listByTagNameAndAfterCreateDate(params: any): Promise<ResourceInfo[]>;
    listByResourceIds(params: any): Promise<ResourceInfo[]>;
}
