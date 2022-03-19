import { FreelogContext } from 'egg-freelog-base';
import { IResourceService } from '../../interface';
export declare class ResourceTagController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    index(): Promise<void>;
    /**
     * 创建资源tag
     */
    create(): Promise<void>;
    /**
     * 批量更新tag
     */
    batchUpdateTagInfo(): Promise<void>;
    /**
     * 当前资源类型可用的tags
     */
    list(): Promise<void>;
}
