import { ICollectionService, IResourceService } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class ResourceCollectionController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    resourceCollectionService: ICollectionService;
    index(): Promise<void>;
    create(): Promise<void>;
    isCollected(): Promise<void>;
    show(): Promise<void>;
    destroy(): Promise<void>;
    count(): Promise<void>;
}
