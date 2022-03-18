import { ResourceInfo } from '../../interface';
import { PageResult } from 'egg-freelog-base';
export declare class ElasticSearchService {
    elasticSearch: any;
    private client;
    constructorBse(): void;
    /**
     * 搜索关键字建议
     * @param prefix
     */
    suggest(prefix: string): Promise<string[]>;
    /**
     * 搜索资源库信息
     * @param skip
     * @param limit
     * @param sort
     * @param keywords
     * @param userId
     * @param resourceType
     * @param omitResourceType
     * @param status
     * @param tags
     */
    search(skip: number, limit: number, sort: object, keywords: string, userId?: number, resourceType?: string, omitResourceType?: string, status?: number, tags?: string[], projection?: string[], beginCreateDate?: Date, endCreateDate?: Date): Promise<PageResult<ResourceInfo>>;
}
