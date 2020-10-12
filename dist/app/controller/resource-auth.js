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
const enum_1 = require("../../enum");
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const auth_interface_1 = require("../../auth-interface");
let ResourceAuthController = class ResourceAuthController {
    async resourceVersionBatchAuth(ctx) {
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
    async resourceAuth(ctx) {
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        const isIncludeUpstreamAuth = ctx.checkQuery('isIncludeUpstreamAuth').optional().toInt().in([0, 1]).default(1).value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const resourceInfo = await this.resourceService.findByResourceId(resourceId, 'latestVersion');
        if (!resourceInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(auth_interface_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subject'));
            return ctx.success(authResult);
        }
        const contracts = await this.outsideApiService.getResourceContracts(resourceId, licenseeId, {
            status: enum_1.ContractStatusEnum.Executed,
            projection: 'authStatus'
        });
        const downstreamAuthResult = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamAuthResult.isAuth) {
            return ctx.success(downstreamAuthResult);
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            const authResult = new auth_interface_1.SubjectAuthResult(auth_interface_1.SubjectAuthCodeEnum.AuthArgumentsError)
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
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供.后续如果考虑实现身份授权链的验证,则可以开放外部调用
    async subjectContractAuth(ctx) {
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
            authResult.setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectNotFound).setErrorMsg(ctx.gettext('params-validate-failed', 'subjectId'));
            return ctx.success(authResult);
        }
        const notFoundContractIds = lodash_1.differenceWith(contractIds, contracts, (x, y) => x === y.contractId);
        if (!lodash_1.isEmpty(notFoundContractIds)) {
            authResult.setData({ notFoundContractIds }).setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractNotFound).setErrorMsg('未找到指定的合约');
            return ctx.success(authResult);
        }
        const downstreamContractAuthResult = this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamContractAuthResult.isAuth || ctx.request.url.includes('/contractAuth/result')) {
            return ctx.success(downstreamContractAuthResult);
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version ?? resourceInfo.latestVersion, 'fileSha1 filename resourceName version systemProperty');
        if (!resourceVersionInfo) {
            authResult.setAuthCode(auth_interface_1.SubjectAuthCodeEnum.AuthArgumentsError).setErrorMsg(ctx.gettext('params-validate-failed', 'version'));
            return ctx.success(authResult);
        }
        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
    async resourceRelationTreeAuthResult(ctx) {
    }
};
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
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    midway_1.get('/batchAuth/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceVersionBatchAuth", null);
__decorate([
    midway_1.get('/:subjectId/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceAuth", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    midway_1.get('/:subjectId/contractAuth/(content|result)'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "subjectContractAuth", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    midway_1.get('/:subjectId/relationTreeAuth/result'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceRelationTreeAuthResult", null);
ResourceAuthController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/auths/resource') // 统一URL v2/auths/:subjectType
], ResourceAuthController);
exports.ResourceAuthController = ResourceAuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyxxQ0FBOEM7QUFDOUMsbUNBQStDO0FBQy9DLG1DQUF3RDtBQUN4RCx1REFBMEU7QUFDMUUsa0ZBQXFFO0FBQ3JFLHlEQUE0RTtBQUs1RSxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtJQWEvQixLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRztRQUU5QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0SCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDdEcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFDLEVBQUMsRUFDbEcsNERBQTRELENBQUMsQ0FBQztRQUVsRSxNQUFNLGVBQWUsR0FBRyx1QkFBYyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN6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