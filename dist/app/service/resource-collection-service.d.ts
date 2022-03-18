import { CollectionResourceInfo, ICollectionService } from '../../interface';
import { IMongodbOperation, PageResult, FreelogContext } from 'egg-freelog-base';
export declare class ResourceCollectionService implements ICollectionService {
    ctx: FreelogContext;
    resourceCollectionProvider: IMongodbOperation<CollectionResourceInfo>;
    collectionResource(model: CollectionResourceInfo): Promise<CollectionResourceInfo>;
    isCollected(resourceIds: string[]): Promise<Array<{
        resourceId: string;
        isCollected: boolean;
    }>>;
    find(condition: object, ...args: any[]): Promise<CollectionResourceInfo[]>;
    findOne(condition: object, ...args: any[]): Promise<CollectionResourceInfo>;
    deleteOne(condition: object): Promise<boolean>;
    count(condition: object): Promise<number>;
    countByResourceIds(condition: object): Promise<Array<{
        resourceId: number;
        count: number;
    }>>;
    findIntervalList(resourceType: string, omitResourceType: string, keywords: string, resourceStatus: number, skip: number, limit: number): Promise<PageResult<CollectionResourceInfo>>;
}
