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
let ResourceAuthController = class ResourceAuthController {
    async resourceAuth(ctx) {
        // const resourceId = ctx.checkParams('subjectId').isResourceId().value;
        // const licenseeId = ctx.checkQuery('licenseeId').optional().value;
        ctx.validateParams();
    }
    // 由于无法确定当前用户与乙方之间的关联,所以关系层面由请求方标的物服务校验,并保证数据真实性.
    // 合同授权接口属于内部接口,不对外提供
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
            msg: ctx.gettext('params-validate-failed', 'version'), data: { resourceId }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY29udHJvbGxlci9yZXNvdXJjZS1hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF3RDtBQUN4RCx1REFBNEY7QUFDNUYsa0ZBQXFFO0FBRXJFLG1DQUErQjtBQUMvQixpQ0FBaUM7QUFLakMsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFVL0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHO1FBQ2xCLHdFQUF3RTtRQUN4RSxvRUFBb0U7UUFDcEUsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxpREFBaUQ7SUFDakQscUJBQXFCO0lBR3JCLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHO1FBRXpCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ3JFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNwSSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDckgsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdDQUFnQyxDQUFDLFdBQVcsRUFBRTtZQUN6RixVQUFVLEVBQUUsVUFBVTtZQUN0QixVQUFVLEVBQUUsWUFBWTtTQUMzQixDQUFDLENBQUM7UUFFSCxJQUFJLGdCQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLGdDQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtTQUMvQztRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLElBQUksbUNBQWdCLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDckM7UUFFRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsdURBQXVELENBQUMsQ0FBQztRQUM3SixHQUFHLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLEVBQUU7WUFDM0MsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFDO1NBQzVFLENBQUMsQ0FBQztRQUVILE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFcEcsR0FBRyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FDSixDQUFBO0FBakRHO0lBREMsZUFBTSxFQUFFOztpRUFDNkI7QUFFdEM7SUFEQyxlQUFNLEVBQUU7O21FQUNpQztBQUUxQztJQURDLGVBQU0sRUFBRTs7c0VBQ3VDO0FBR2hEO0lBREMsWUFBRyxDQUFDLG9CQUFvQixDQUFDOzs7OzBEQUt6QjtBQU1EO0lBRkMseUNBQWUsQ0FBQyxpQ0FBYyxHQUFHLDRCQUFTLENBQUM7SUFDM0MsWUFBRyxDQUFDLGtDQUFrQyxDQUFDOzs7O2lFQWdDdkM7QUFuRFEsc0JBQXNCO0lBRmxDLGdCQUFPLEVBQUU7SUFDVCxtQkFBVSxDQUFDLG9CQUFvQixDQUFDO0dBQ3BCLHNCQUFzQixDQW9EbEM7QUFwRFksd0RBQXNCIn0=