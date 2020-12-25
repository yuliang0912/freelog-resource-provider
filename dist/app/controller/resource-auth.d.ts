import { IOutsideApiService, IResourceAuthService, IResourceService, IResourceVersionService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class ResourceAuthController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    resourceAuthService: IResourceAuthService;
    resourceVersionService: IResourceVersionService;
    /**
     * 展品服务的色块
     */
    serviceStates(): Promise<void>;
    resourceVersionBatchAuth(): Promise<void>;
    resourceAuth(): Promise<FreelogContext>;
    resourceUpstreamAuth(): Promise<FreelogContext>;
    subjectContractAuth(): Promise<FreelogContext>;
    resourceRelationTreeAuthResult(): Promise<FreelogContext>;
}
