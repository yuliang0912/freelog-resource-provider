import { FreelogContext, IMongodbOperation, PageResult } from 'egg-freelog-base';
import { ResourceInfo } from '../../interface';
export declare class ResourceOperationService {
    ctx: FreelogContext;
    resourceProvider: IMongodbOperation<ResourceInfo>;
    resourceOperationProvider: IMongodbOperation<any>;
    /**
     * 创建资源运营类数据
     * @param type
     * @param resourceList
     * @param attachData
     */
    createResourceOperationDatas(type: number, resourceList: ResourceInfo[], attachData?: object): Promise<true | any[]>;
    /**
     * 删除资源运营类数据
     * @param type
     * @param resourceList
     */
    deleteResourceOperationDatas(type: number, resourceList: ResourceInfo[]): Promise<boolean>;
    /**
     * 分页查找资源
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<any>>;
    /**
     * 关联搜索
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    findIntervalListJoinResource(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<any>>;
}
