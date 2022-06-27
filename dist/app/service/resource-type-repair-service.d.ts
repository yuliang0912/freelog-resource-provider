import { IMongodbOperation } from 'egg-freelog-base';
import { CollectionResourceInfo, ResourceInfo, ResourceVersionInfo } from '../../interface';
export declare class ResourceTypeRepairService {
    resourceProvider: IMongodbOperation<ResourceInfo>;
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    resourceCollectionProvider: IMongodbOperation<CollectionResourceInfo>;
    /**
     * 资源类型数据修复,单字符串改成数组
     */
    resourceTypeRepair(): Promise<void>;
}
