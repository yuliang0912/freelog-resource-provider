"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAuthController = void 0;
const semver = require("semver");
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const auth_interface_1 = require("../../auth-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceAuthController = class ResourceAuthController {
    ctx;
    resourceService;
    outsideApiService;
    resourceAuthService;
    resourceVersionService;
    /**
     * 展品服务的色块
     */
    async serviceStates() {
        this.ctx.success([
            { name: 'active', type: 'authorization', value: 1 },
            { name: 'testActive', type: 'testAuthorization', value: 2 }
        ]);
    }
    async resourceVersionBatchAuth() {
        const { ctx } = this;
        const resourceVersionIds = ctx.checkQuery('resourceVersionIds').exist().isSplitMd5().toSplitArray().len(1, 500).value;
        const authType = ctx.checkQuery('authType').optional().in(['testAuth', 'auth']).default('auth').value;
        ctx.validateParams();
        const resourceVersions = await this.resourceVersionService.find({ versionId: { $in: resourceVersionIds } }, 'resourceId resourceName version versionId resolveResources');
        const validVersionIds = (0, lodash_1.differenceWith)(resourceVersionIds, resourceVersions, (x, y) => x === y.versionId);
        if (!(0, lodash_1.isEmpty)(validVersionIds)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'resourceVersionIds'), { validVersionIds });
        }
        await this.resourceAuthService.resourceBatchAuth(resourceVersions, authType).then(ctx.success);
    }
    // 资源批量授权
    async resourceBatchAuth() {
        const resourceIds = this.ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 100).value;
        const versionRanges = this.ctx.checkQuery('versionRanges').optional().toSplitArray().len(1, 100).value;
        const versions = this.ctx.checkQuery('versions').optional().toSplitArray().len(1, 100).value;
        this.ctx.validateParams();
        if ((versions && versions.length !== resourceIds.length) || (versionRanges && versionRanges.length !== resourceIds.length)) {
            throw new egg_freelog_base_1.ArgumentError('版本个数需要与资源个数相匹配');
        }
        const resourceVersionIds = [];
        const resourceList = await this.resourceService.find({ _id: { $in: resourceIds }, status: 1 }, 'resourceVersions');
        for (let i = 0; i < resourceIds.length; i++) {
            const resourceInfo = resourceList.find(x => x.resourceId === resourceIds[i]);
            if (!resourceInfo) {
                throw new egg_freelog_base_1.ArgumentError('资源不存在', { resourceId: resourceIds[i] });
            }
            const resourceVersions = resourceInfo.resourceVersions;
            let version = (0, lodash_1.last)(resourceVersions).version;
            if (versions) {
                version = versions[i];
            }
            else if (versionRanges) {
                version = semver.maxSatisfying(resourceVersions.map(x => x.version), versionRanges[i]);
            }
            const resourceVersionInfo = resourceVersions.find(x => x.version === version);
            if (!resourceVersionInfo) {
                throw new egg_freelog_base_1.ArgumentError('资源版本不匹配', {
                    resourceId: resourceInfo.resourceId, version,
                    versionRange: versionRanges ? versionRanges[i] : undefined
                });
            }
            resourceVersionIds.push(resourceVersionInfo.versionId);
        }
        const resourceVersionList = await this.resourceVersionService.find({ versionId: { $in: resourceVersionIds } });
        const resourceAuthResults = await this.resourceAuthService.resourceBatchAuth(resourceVersionList, 'auth');
        this.ctx.success(resourceAuthResults.map(x => {
            return {
                resourceId: x.resourceId,
                resourceName: x.resourceName,
                version: x.version,
                isAuth: x.resolveResourceAuthResults.every(m => m.authResult.isAuth)
            };
        }));
    }
    async resourceAuth() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        const isIncludeUpstreamAuth = ctx.checkQuery('isIncludeUpstreamAuth').optional().toInt().in([0, 1]).default(1).value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId, 'latestVersion');
        if (!resourceInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
            return ctx.success(authResult);
        }
        const contracts = await this.outsideApiService.getResourceContracts(resourceId, licenseeId, {
            status: egg_freelog_base_1.ContractStatusEnum.Executed,
            projection: 'authStatus'
        });
        const downstreamAuthResult = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamAuthResult.isAuth) {
            return ctx.success(downstreamAuthResult);
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError)
                .setData({ resourceId, version })
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
    async resourceUpstreamAuth() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId, 'latestVersion');
        if (!resourceInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
            return ctx.success(authResult);
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError)
                .setData({ resourceId, version })
                .setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(resourceVersionInfo);
        const upstreamAuthResult = await this.resourceAuthService.resourceUpstreamAuth(resourceAuthTree);
        ctx.success(upstreamAuthResult);
    }
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供.后续如果考虑实现身份授权链的验证,则可以开放外部调用
    async subjectContractAuth() {
        const { ctx } = this;
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const contractIds = ctx.checkQuery('contractIds').exist().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const authResult = new auth_interface_1.SubjectAuthResult();
        const getResourceInfoTask = this.resourceService.findByResourceId(resourceId, 'latestVersion');
        const getContractsTask = this.outsideApiService.getContractByContractIds(contractIds, {
            projection: 'authStatus,subjectType,subjectId'
        });
        const [resourceInfo, contracts] = await Promise.all([getResourceInfoTask, getContractsTask]);
        if (!resourceInfo) {
            authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subjectId'));
            return ctx.success(authResult);
        }
        const notFoundContractIds = (0, lodash_1.differenceWith)(contractIds, contracts, (x, y) => x === y.contractId);
        if (!(0, lodash_1.isEmpty)(notFoundContractIds)) {
            authResult.setData({ notFoundContractIds }).setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound).setErrorMsg('未找到指定的合约');
            return ctx.success(authResult);
        }
        const downstreamContractAuthResult = this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamContractAuthResult.isAuth || ctx.request.url.includes('/contractAuth/result')) {
            return ctx.success(downstreamContractAuthResult);
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.AuthArgumentsError).setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }
        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize.toString());
        ctx.attachment(fileStreamInfo.fileName);
    }
    async resourceRelationTreeAuthResult() {
        const { ctx } = this;
        const resourceIdOrName = ctx.checkParams('subjectId').exist().decodeURIComponent().value;
        const version = ctx.checkQuery('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const versionRange = ctx.checkQuery('versionRange').optional().is(semver.validRange, ctx.gettext('params-format-validate-failed', 'versionRange')).value;
        // const isContainRootNode = ctx.checkQuery('isContainRootNode').optional().default(false).toBoolean().value;
        ctx.validateParams();
        let resourceInfo = null;
        if (egg_freelog_base_1.CommonRegex.mongoObjectId.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findByResourceId(resourceIdOrName);
        }
        else if (egg_freelog_base_1.CommonRegex.fullResourceName.test(resourceIdOrName)) {
            resourceInfo = await this.resourceService.findOneByResourceName(resourceIdOrName);
        }
        else {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-format-validate-failed', 'resourceIdOrName'));
        }
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceIdOrName'),
            data: { resourceIdOrName }
        });
        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if ((0, lodash_1.isString)(version)) {
            resourceVersion = version;
        }
        else if ((0, lodash_1.isString)(versionRange)) {
            resourceVersion = semver.maxSatisfying(resourceInfo.resourceVersions.map(x => x.version), versionRange);
        }
        if (!resourceVersion) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'versionRange'));
        }
        const versionInfo = await this.resourceVersionService.findOneByVersion(resourceInfo.resourceId, resourceVersion);
        ctx.entityNullObjectCheck(versionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'),
            data: { version }
        });
        await this.resourceAuthService.resourceRelationTreeAuth(resourceInfo, versionInfo).then(ctx.success);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "outsideApiService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceAuthService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceVersionService", void 0);
__decorate([
    (0, midway_1.get)('/serviceStates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "serviceStates", null);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    (0, midway_1.get)('/batchAuth/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceVersionBatchAuth", null);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    (0, midway_1.get)('/batchAuth/results'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceBatchAuth", null);
__decorate([
    (0, midway_1.get)('/:subjectId/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceAuth", null);
__decorate([
    (0, midway_1.get)('/:subjectId/upstreamAuth/result'),
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceUpstreamAuth", null);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    (0, midway_1.get)('/:subjectId/contractAuth/(fileStream|result)'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "subjectContractAuth", null);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    (0, midway_1.get)('/:subjectId/relationTreeAuth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceRelationTreeAuthResult", null);
ResourceAuthController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/auths/resources') // 统一URL v2/auths/:subjectType
], ResourceAuthController);
exports.ResourceAuthController = ResourceAuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBK0Q7QUFDL0QsbUNBQXdEO0FBQ3hELHlEQUF1RDtBQUV2RCx1REFRMEI7QUFJMUIsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFHL0IsR0FBRyxDQUFpQjtJQUVwQixlQUFlLENBQW1CO0lBRWxDLGlCQUFpQixDQUFxQjtJQUV0QyxtQkFBbUIsQ0FBdUI7SUFFMUMsc0JBQXNCLENBQTBCO0lBRWhEOztPQUVHO0lBRUgsS0FBSyxDQUFDLGFBQWE7UUFDZixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNiLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7WUFDakQsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDO1NBQzVELENBQUMsQ0FBQztJQUNQLENBQUM7SUFJRCxLQUFLLENBQUMsd0JBQXdCO1FBRTFCLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdEgsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMs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