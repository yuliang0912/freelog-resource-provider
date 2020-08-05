import { IJsonSchemaValidate, IResourceService, IResourceVersionService, IOutsideApiService } from '../../interface';
export declare class ResourceVersionController {
    resourcePropertyGenerator: any;
    resourceService: IResourceService;
    resourceUpcastValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    customPropertyValidator: IJsonSchemaValidate;
    outsideApiService: IOutsideApiService;
    index(ctx: any): Promise<void>;
    detail(ctx: any): Promise<void>;
    list(ctx: any): Promise<void>;
    /**
     * 保存草稿.一个资源只能保存一次草稿
     * @param ctx
     * @returns {Promise<void>}
     */
    resourceVersionDraft(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    versionsBySha1(ctx: any): Promise<void>;
    update(ctx: any): Promise<void>;
    /**
     * 保存草稿.一个资源只能保存一次草稿
     * @param ctx
     * @returns {Promise<void>}
     */
    createOrUpdateResourceVersionDraft(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    /**
     * 验证文件是否可以被创建成资源版本
     */
    fileIsCanBeCreate(ctx: any): Promise<void>;
}
