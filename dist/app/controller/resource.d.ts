import { FreelogContext, IJsonSchemaValidate } from 'egg-freelog-base';
import { IResourceService, IResourceVersionService } from '../../interface';
export declare class ResourceController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    resourcePolicyValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    index(): Promise<FreelogContext>;
    create(ctx: FreelogContext): Promise<void>;
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
     * 策略格式校验
     * @param policies
     * @param mode
     */
    _policySchemaValidate(policies: any[], mode: 'addPolicy' | 'updatePolicy'): void;
}
