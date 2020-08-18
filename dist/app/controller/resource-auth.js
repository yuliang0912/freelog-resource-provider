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
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const vistorIdentityDecorator_1 = require("../../extend/vistorIdentityDecorator");
const lodash_1 = require("lodash");
const semver = require("semver");
const enum_1 = require("../../enum");
let ResourceAuthController = class ResourceAuthController {
    async resourceAuth(ctx) {
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        ctx.validateParams();
        const options = {
            status: enum_1.ContractStatusEnum.Exception,
            projection: 'authStatus'
        };
        const contracts = await this.outsideApiService.getResourceContracts(resourceId, licenseeId, options);
        const downstreamIsAuth = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!downstreamIsAuth) {
            throw new egg_freelog_base_1.ApplicationError('授权失败');
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'fileSha1 filename resourceName version systemProperty');
        ctx.entityNullObjectCheck(resourceVersionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: { resourceId, version }
        });
        // const upstreamIsAuth = await this.resourceAuthService.resourceDependencyAuth(resourceVersionInfo);
        // if (!upstreamIsAuth) {
        //     throw new ApplicationError('资源上游授权链路失败');
        // }
        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供.后续如果考虑实现身份授权链的验证,则可以开放外部调用
    async subjectContractAuth(ctx) {
        const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        const version = ctx.checkBody('version').optional().is(semver.valid, ctx.gettext('params-format-validate-failed', 'version')).value;
        const contractIds = ctx.checkQuery('contractIds').optional().isSplitMongoObjectId().toSplitArray().len(1, 100).value;
        ctx.validateParams();
        const contracts = await this.outsideApiService.getResourceContractByContractIds(contractIds, {
            licensorId: resourceId,
            projection: 'authStatus'
        });
        if (lodash_1.isEmpty(contracts)) {
            throw new egg_freelog_base_1.ArgumentError('invalid contracts');
        }
        const isAuth = await this.resourceAuthService.contractAuth(resourceId, contracts, 'auth');
        if (!isAuth) {
            throw new egg_freelog_base_1.ApplicationError('授权失败');
        }
        const resourceVersionInfo = await this.resourceVersionService.findOneByVersion(resourceId, version, 'fileSha1 filename resourceName version systemProperty');
        ctx.entityNullObjectCheck(resourceVersionInfo, {
            msg: ctx.gettext('params-validate-failed', 'version'), data: { resourceId, version }
        });
        const fileStreamInfo = await this.resourceVersionService.getResourceFileStream(resourceVersionInfo);
        ctx.body = fileStreamInfo.fileStream;
        ctx.set('content-length', fileStreamInfo.fileSize);
        ctx.attachment(fileStreamInfo.fileName);
    }
};
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
    midway_1.get('/:subjectId/result'),
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.LoginUser),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "resourceAuth", null);
__decorate([
    vistorIdentityDecorator_1.visitorIdentity(egg_freelog_base_1.InternalClient | egg_freelog_base_1.LoginUser),
    midway_1.get('/:subjectId/contractAuth/content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceAuthController.prototype, "subjectContractAuth", null);
ResourceAuthController = __decorate([
    midway_1.provide(),
    midway_1.controller('/v2/auths/resource')
], ResourceAuthController);
exports.ResourceAuthController = ResourceAuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF3RDtBQUN4RCx1REFBNEY7QUFDNUYsa0ZBQXFFO0FBRXJFLG1DQUErQjtBQUMvQixpQ0FBaUM7QUFDakMscUNBQThDO0FBSTlDLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBVy9CLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRztRQUNsQixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNyRSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNqRSxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEksR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sT0FBTyxHQUFHO1lBQ1osTUFBTSxFQUFFLHlCQUFrQixDQUFDLFNBQVM7WUFDcEMsVUFBVSxFQUFFLFlBQVk7U0FDM0IsQ0FBQTtRQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckcsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFNB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