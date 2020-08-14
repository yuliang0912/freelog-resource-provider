import { IOutsideApiService, IResourceAuthService, IResourceVersionService } from '../../interface';
export declare class ResourceAuthController {
    outsideApiService: IOutsideApiService;
    resourceAuthService: IResourceAuthService;
    resourceVersionService: IResourceVersionService;
    resourceAuth(ctx: any): Promise<void>;
    subjectContractAuth(ctx: any): Promise<void>;
}
