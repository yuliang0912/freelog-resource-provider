import { FreelogContext } from 'egg-freelog-base';
import { ResourceOperationService } from '../service/resource-operation-service';
import { IResourceService } from '../../interface';
export declare class ResourceOperationController {
    ctx: FreelogContext;
    resourceOperationService: ResourceOperationService;
    resourceService: IResourceService;
    batchCreate(): Promise<void>;
    batchDelete(): Promise<void>;
    index(): Promise<FreelogContext>;
}
