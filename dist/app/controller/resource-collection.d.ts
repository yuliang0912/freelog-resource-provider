import { ICollectionService, IResourceService } from '../../interface';
export declare class ResourceCollectionController {
    resourceService: IResourceService;
    resourceCollectionService: ICollectionService;
    index(ctx: any): Promise<void>;
    create(ctx: any): Promise<void>;
    isCollected(ctx: any): Promise<void>;
    show(ctx: any): Promise<void>;
    destroy(ctx: any): Promise<void>;
    count(ctx: any): Promise<void>;
}
