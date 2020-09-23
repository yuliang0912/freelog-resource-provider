import { IJsonSchemaValidate, IResourceService, IResourceVersionService } from '../../interface';
export declare class ResourceController {
    ctx: any;
    resourceService: IResourceService;
    resourcePolicyValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    index(ctx: any): Promise<any>;
    create(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    dependencyTree(ctx: any): Promise<any>;
    show(ctx: any): Promise<void>;
    contractCoverageVersions(ctx: any): Promise<void>;
    contractsCoverageVersions(ctx: any): Promise<void>;
    allResolveResources(ctx: any): Promise<void>;
    /**
     * 策略格式校验
     * @param policies
     * @private
     */
    _policySchemaValidate(policies: any): void;
}
