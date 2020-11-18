import { IResourceService, IResourceVersionService, IOutsideApiService } from '../../interface';
import { FreelogContext, IJsonSchemaValidate } from 'egg-freelog-base';
export declare class ResourceVersionController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    customPropertyValidator: IJsonSchemaValidate;
    resourceUpcastValidator: IJsonSchemaValidate;
    resourceVersionService: IResourceVersionService;
    resolveDependencyOrUpcastValidator: IJsonSchemaValidate;
    resourceVersionDependencyValidator: IJsonSchemaValidate;
    batchSignSubjectValidator: IJsonSchemaValidate;
    index(): Promise<void>;
    detail(): Promise<void>;
    list(): Promise<void>;
    resourceVersionDraft(): Promise<void>;
    create(): Promise<void>;
    versionsBySha1(): Promise<void>;
    createOrUpdateResourceVersionDraft(): Promise<void>;
    validateResourceVersionDependencies(): Promise<void>;
    show(): Promise<void>;
    download(): Promise<void>;
    fileIsCanBeCreate(): Promise<void>;
    batchSignAndSetContractToVersion(): Promise<void>;
    update(): Promise<void>;
}
