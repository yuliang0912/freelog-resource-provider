import { IOutsideApiService, IResourceAuthService, IResourceService, IResourceVersionService } from '../../interface';
export declare class ResourceAuthController {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    resourceAuthService: IResourceAuthService;
    resourceVersionService: IResourceVersionService;
    resourceVersionBatchAuth(ctx: any): Promise<void>;
    resourceAuth(ctx: any): Promise<any>;
    resourceUpstreamAuth(ctx: any): Promise<any>;
    subjectContractAuth(ctx: any): Promise<any>;
    resourceRelationTreeAuthResult(ctx: any): Promise<any>;
}
