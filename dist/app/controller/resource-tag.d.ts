import { FreelogContext } from 'egg-freelog-base';
import { IResourceService } from '../../interface';
export declare class ResourceTagController {
    ctx: FreelogContext;
    resourceService: IResourceService;
    /**
     * 创建资源tag
     */
    create(): Promise<void>;
    /**
     * 创建资源tag
     */
    updateTagInfo(): Promise<void>;
    /**
     * 当前资源类型可用的tags
     */
    list(): Promise<void>;
}
