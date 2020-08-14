import { IJsonSchemaValidate, IResourceService, IResourceVersionService, IOutsideApiService } from '../../interface';
export declare class ResourceVersionController {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    resourceVersionService: IResourceVersionService;
    customPropertyValidator: IJsonSchemaValidate;
    resourceUpcastValidator: IJsonSchemaValidate;
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    index(ctx: any): Promise<void>;
    detail(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    resourceVersionDraft(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    versionsBySha1(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    createOrUpdateResourceVersionDraft(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    download(ctx: any): Promise<void>;
    fileIsCanBeCreate(ctx: any): Promise<void>;
}
