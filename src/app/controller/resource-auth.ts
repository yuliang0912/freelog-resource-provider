import {controller, get, provide, inject} from 'midway';
import {InternalClient, ApplicationError, LoginUser, ArgumentError} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {IOutsideApiService, IResourceAuthService, IResourceVersionService} from '../../interface';
import {isEmpty} from 'lodash';
import * as semver from 'semver';


@provide()
@controller('/v2/auths/resource')
export class ResourceAuthController {

    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    resourceAuthService: IResourceAuthService;
    @inject()
    resourceVersionService: IResourceVersionService;

    @get('/:subjectId/result')
    async resourceAuth(ctx) {
        // const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        // const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        ctx.validateParams();
    }

    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供
    @visitorIdentity(InternalClient | LoginUser)
    @get('/:subjectId/contractAuth/content')
    async subjectContractAuth(ctx) {

        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();

        const contracts = await this.outsideApiService.getResourceContractByContractIds(contractIds, {
            licensorId: resourceId,
            projection: 'authStatus'
        });

        if (isEmpty(contracts)) {
            throw new ArgumentError('invalid contracts')
        }

        const isAuth = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!isAuth) {
            throw new ApplicationError('授权失败')
        }

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'fileSha1 filename resourceName version systemProperty');
        ctx.entityNullObjectCheck(resourceVersionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: {resourceId}
        });

        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);

        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
}