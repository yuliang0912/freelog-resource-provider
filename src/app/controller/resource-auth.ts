import {controller, get, provide} from 'midway';
import {InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';

@provide()
@controller('/v2/auths/resource')
export class ResourceAuthController {

    @get('/:subjectId/result')
    async resourceAuth(ctx) {
        // const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        // const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        ctx.validateParams();
    }

    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供
    @visitorIdentity(InternalClient)
    @get('/:subjectId/contractAuth/content')
    async subjectContractAuth(ctx) {

        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        /**
         * TODO:直接根据合约查询授权状态即可.
         */
        ctx.success(contractIds, resourceId);
    }
}