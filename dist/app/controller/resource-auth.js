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
        const validVersionIds = lodash_1.differenceWith(resourceVersionIds, resourceVersions, (x, y) => x === y.versionId);
        if (!lodash_1.isEmpty(validVersionIds)) {
            throw new egg_freelog_base_1.ArgumentError(ctx.gettext('params-validate-failed', 'resourceVersionIds'), { validVersionIds });
        }
        await this.resourceAuthService.resourceBatchAuth(resourceVersions, authType).then(ctx.success);
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
        const notFoundContractIds = lodash_1.differenceWith(contractIds, contracts, (x, y) => x === y.contractId);
        if (!lodash_1.isEmpty(notFoundContractIds)) {
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
        if (lodash_1.isEmpty(resourceInfo.resourceVersions)) {
            return ctx.success([]);
        }
        let resourceVersion = resourceInfo.latestVersion;
        if (lodash_1.isString(version)) {
            resourceVersion = version;
        }
        else if (lodash_1.isString(versionRange)) {
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
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceAuthService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthController.prototype, "resourceVersionService", void 0);
__decorate([
    midway_1.get('/serviceStates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "serviceStates", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/batchAuth/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceVersionBatchAuth", null);
__decorate([
    midway_1.get('/:subjectId/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceAuth", null);
__decorate([
    midway_1.get('/:subjectId/upstreamAuth/result'),
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceUpstreamAuth", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.InternalClient | egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/:subjectId/contractAuth/(fileStream|result)'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "subjectContractAuth", null);
__decorate([
    egg_freelog_base_1.visitorIdentityValidator(egg_freelog_base_1.IdentityTypeEnum.LoginUser),
    midway_1.get('/:subjectId/relationTreeAuth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceRelationTreeAuthResult", null);
ResourceAuthController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/auths/resources') // 统一URL v2/auths/:subjectType
], ResourceAuthController);
exports.ResourceAuthController = ResourceAuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBeUQ7QUFDekQsbUNBQXdEO0FBQ3hELHlEQUF1RDtBQUV2RCx1REFRMEI7QUFJMUIsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFhL0I7O09BRUc7SUFFSCxLQUFLLENBQUMsYUFBYTtRQUNmLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ2IsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQztZQUNqRCxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUM7U0FDNUQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUlELEtBQUssQ0FBQyx3QkFBd0I7UUFFMUIsTUFBTSxFQUFDLEdBQUcsRUFBQyxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0SCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdEcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sZ0JBQWdCLEdB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