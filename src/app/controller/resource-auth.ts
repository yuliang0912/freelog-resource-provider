import * as semver from 'semver';
import {differenceWith, isEmpty, isString} from 'lodash';
import {controller, get, inject, provide} from 'midway';
import {SubjectAuthResult} from "../../auth-interface";
import {IOutsideApiService, IResourceAuthService, IResourceService, IResourceVersionService} from '../../interface';
import {
    ArgumentError,
    IdentityTypeEnum,
    visitorIdentityValidator,
    CommonRegex,
    FreelogContext,
    ContractStatusEnum,
    SubjectAuthCodeEnum
} from 'egg-freelog-base';

@provide()
@controller('/v2/auths/resources') // 统一URL v2/auths/:subjectType
export class ResourceAuthController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    resourceAuthService: IResourceAuthService;
    @inject()
    resourceVersionService: IResourceVersionService;

    /**
     * 展品服务的色块
     */
    @get('/serviceStates')
    async serviceStates() {
        this.ctx.success([
            {name: 'active', type: 'authorization', value: 1},
            {name: 'testActive', type: 'testAuthorization', value: 2}
        ])
    }

    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    @get('/batchAuth/result')
    async resourceVersionBatchAuth() {

        const {ctx} = this;
        const resourceVersionIds = ctx.checkQuery('resourceVersionIds').exist().isSplitMd5().toSplitArray().len(1, 500).value;
        const authType = ctx.checkQuery('authType').optional().in(['testAuth', 'auth']).default('auth').value;
        ctx.validateParams();

        const resourceVersions = await this.resourceVersionService.find({versionId: {$in: resourceVersionIds}},
            'resourceId resourceName version versionId resolveResources');

        const validVersionIds = differenceWith(resourceVersionIds, resourceVersions, (x: string, y) => x === y.versionId)
        if (!isEmpty(validVersionIds)) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'resourceVersionIds'), {validVersionIds});
        }

        await this.resourceAuthService.resourceBatchAuth(resourceVersions, authType).then(ctx.success);
    }

    @get('/:subjectId/result')
    async resourceAuth() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        const isIncludeUpstreamAuth = ctx.checkQuery('isIncludeUpstreamAuth').optional().toInt().in([0, 1]).default(1).value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId, 'latestVersion');
        if (!resourceInfo) {
            const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
            return ctx.success(authResult);
        }

        const contracts = await this.outsideApiService.getResourceContracts(resourceId, licenseeId, {
            status: ContractStatusEnum.Executed,
            projection: 'authStatus'
        });

        const downstreamAuthResult = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamAuthResult.isAuth) {
            return ctx.success(downstreamAuthResult);
        }

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.AuthArgumentsError)
                .setData({resourceId, version})
                .setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }

        const upstreamAuthResult = await this.resourceAuthService.resourceAuth(resourceVersionInfo, isIncludeUpstreamAuth);
        if (!upstreamAuthResult.isAuth) {
            return ctx.success(upstreamAuthResult);
        }

        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);

        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize.toString());
        ctx.attachment(fileStreamInfo.fileName);
    }

    @get('/:subjectId/upstreamAuth/result')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async resourceUpstreamAuth() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId, 'latestVersion');
        if (!resourceInfo) {
            const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
            return ctx.success(authResult);
        }

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.AuthArgumentsError)
                .setData({resourceId, version})
                .setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }

        const resourceAuthTree = await this.resourceService.getResourceAuthTree(resourceVersionInfo);
        const upstreamAuthResult = await this.resourceAuthService.resourceUpstreamAuth(resourceAuthTree);

        ctx.success(upstreamAuthResult);
    }

    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供.后续如果考虑实现身份授权链的验证,则可以开放外部调用
    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    @get('/:subjectId/contractAuth/(fileStream|result)')
    async subjectContractAuth() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();

        const authResult = new SubjectAuthResult();

        const getResourceInfoTask = this.resourceService.findByResourceId(resourceId, 'latestVersion');
        const getContractsTask = this.outsideApiService.getContractByContractIds(contractIds, {
            projection: 'authStatus,subjectType,subjectId'
        });

        const [resourceInfo, contracts] = await Promise.all([getResourceInfoTask, getContractsTask]);
        if (!resourceInfo) {
            authResult.setAuthCode(SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subjectId'));
            return ctx.success(authResult);
        }
        const notFoundContractIds = differenceWith(contractIds, contracts, (x: string, y) => x === y.contractId);
        if (!isEmpty(notFoundContractIds)) {
            authResult.setData({notFoundContractIds}).setAuthCode(SubjectAuthCodeEnum.SubjectContractNotFound).setErrorMsg('未找到指定的合约');
            return ctx.success(authResult);
        }

        const downstreamContractAuthResult = this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamContractAuthResult.isAuth || ctx.request.url.includes('/contractAuth/result')) {
            return ctx.success(downstreamContractAuthResult);
        }

        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            authResult.setAuthCode(SubjectAuthCodeEnum.AuthArgumentsError).setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }

        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize.toString());
        ctx.attachment(fileStreamInfo.fileName);
    }

    @visitorIdentityValidator(IdentityTypeEnum.InternalClient | IdentityTypeEnum.LoginUser)
    @get('/:subjectId/relationTreeAuth')
    async resourceRelationTreeAuthResult() {

        const {ctx} = this;
        const resourceIdOrName = ctx.checkParams('subjectId').exist().decodeURIComponent().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();

        let resourceInfo = null;
        if (CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        } else if (CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        } else {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }

        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: {resourceIdOrName}
        });

        if (isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }

        let resourceVersion = resourceInfo.latestVersion;
        if (isString(version)) {
            resourceVersion = version;
        } else if (isString(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'))
        }

        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: {version}
        });

        await this.resourceAuthService.resourceRelationTreeAuth(resourceInfo, versionInfo).then(ctx.success);
    }
}
