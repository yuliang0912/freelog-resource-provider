import {controller, inject, post, provide} from 'midway';
import {FreelogContext} from 'egg-freelog-base';

@provide()
@controller('/v2/resourceGroups')
export class ResourceGroupController {

    @inject()
    ctx: FreelogContext;

    /**
     * 创建用户分组
     */
    @post('/')
    async create() {
        const {ctx} = this;
        // const name = ctx.checkBody('name').exist().isResourceName().trim().value;
        // const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        // const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        // const intro = ctx.checkBody('intro').optional().default('').len(0, 1000).value;
        // const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        // const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value; // 单个标签长度也限制为20,未实现
        ctx.validateParams();
    }
}
