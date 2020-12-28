import { IResourceService, IResourceVersionService } from '../../interface';
import { FreelogContext, IJsonSchemaValidate } from 'egg-freelog-base';
export declare class ResourceController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    resourcePolicyValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    index(): Promise<void>;
    create(ctx: FreelogContext): Promise<void>;
    createdCount(): Promise<void>;
    list(): Promise<void>;
    update(): Promise<void>;
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
     * 策略格式校验
     * @param policies
     * @param mode
     */
    _policySchemaValidate(policies: any[], mode: 'addPolicy' | 'updatePolicy'): void;
}
