import { IJsonSchemaValidate, IResourceService, IResourceVersionService } from '../../interface';
export declare class ResourceVersionController {
    resourcePropertyGenerator: any;
    resourceService: IResourceService;
    resourceUpcastValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    customPropertyValidator: IJsonSchemaValidate;
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
    createResourceVersionDraft(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
}
