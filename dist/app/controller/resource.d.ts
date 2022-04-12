import { IResourceService, IResourceVersionService } from '../../interface';
import { FreelogContext, IJsonSchemaValidate } from 'egg-freelog-base';
import { ElasticSearchService } from '../service/elastic-search-service';
export declare class ResourceController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    resourcePolicyValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    elasticSearchService: ElasticSearchService;
    /**
     * DB搜索资源列表
     */
    dbSearch(): Promise<void>;
    /**
     * ES搜索资源列表
     */
    esSearch(): Promise<void>;
    /**
     * 搜索关键字补全
     */
    keywordSuggest(): Promise<void>;
    create(ctx: FreelogContext): Promise<void>;
    createdCount(): Promise<void>;
    list(): Promise<void>;
    update(): Promise<void>;
    batchSetOrRemoveResourceTag(): Promise<void>;
    dependencyTree(): Promise<FreelogContext>;
    authTree(): Promise<FreelogContext>;
    relationTree(): Promise<FreelogContext>;
    show(): Promise<void>;
    contractCoverageVersions(): Promise<void>;
    contractsCoverageVersions(): Promise<void>;
    allResolveResources(): Promise<void>;
    /**
     * 根据sha1查询资料列表
     */
    resourceBySha1(): Promise<FreelogContext>;
    /**
     * 批量冻结或解冻资源
     */
    batchFreeOrRecoverResource(): Promise<void>;
    /**
     * 资源冻结或解冻记录
     */
    freeOrRecoverRecords(): Promise<void>;
    /**
     * 策略格式校验
     * @param policies
     * @param mode
     */
    _policySchemaValidate(policies: any[], mode: 'addPolicy' | 'updatePolicy'): void;
}
