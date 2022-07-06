import { IMongodbOperation } from 'egg-freelog-base';
import { CollectionResourceInfo, ResourceInfo, ResourceVersionInfo } from '../../interface';
import { OutsideApiService } from './outside-api-service';
export declare class ResourceTypeRepairService {
    resourceProvider: IMongodbOperation<ResourceInfo>;
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    resourceCollectionProvider: IMongodbOperation<CollectionResourceInfo>;
    outsideApiService: OutsideApiService;
    resourceTypeMap: Map<string, string[]>;
    /**
     * 资源类型数据修复,单字符串改成数组
     */
    resourceTypeRepair(): Promise<void>;
    /**
     * 资源meta修复
     */
    resourceMetaRepair(): Promise<void>;
}
