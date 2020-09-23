import { IOutsideApiService, IResourceAuthService, IResourceService, IResourceVersionService } from '../../interface';
export declare class ResourceAuthController {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    resourceAuthService: IResourceAuthService;
    resourceVersionService: IResourceVersionService;
    resourceBatchAuth(ctx: any): Promise<void>;
    resourceAuth(ctx: any): Promise<any>;
    subjectContractAuth(ctx: any): Promise<any>;
    authTree(ctx: any): Promise<void>;
}
