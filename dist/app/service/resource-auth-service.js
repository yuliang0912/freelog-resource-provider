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
exports.ResourceAuthService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const enum_1 = require("../../enum");
const auth_enum_1 = require("../../auth-enum");
const auth_enum_2 = require("../../auth-enum");
let ResourceAuthService = class ResourceAuthService {
    async contractAuth(subjectId, contracts, authType) {
        const authResult = new auth_enum_1.SubjectAuthResult();
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            return authResult.setAuthCode(auth_enum_2.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        const invalidContracts = contracts.filter(x => x.subjectType !== enum_1.SubjectTypeEnum.Resource || x.subjectId !== subjectId);
        if (!lodash_1.isEmpty(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({ invalidContracts })
                .setAuthCode(auth_enum_2.SubjectAuthCodeEnum.SubjectContractInvalid);
        }
        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : x.isTestAuth));
        if (!isExistAuthContracts) {
            return authResult.setErrorMsg('合约授权未通过')
                .setAuthCode(auth_enum_2.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        return authResult.setAuthCode(auth_enum_2.SubjectAuthCodeEnum.BasedOnContractAuthorized);
    }
    /**
     * 资源授权
     * @param versionInfo
     */
    async resourceAuth(versionInfo, isIncludeUpstreamAuth) {
        const authResult = new auth_enum_1.SubjectAuthResult(auth_enum_2.SubjectAuthCodeEnum.BasedOnContractAuthorized);
        if (lodash_1.isEmpty(versionInfo.resolveResources)) {
            return authResult.setAuthCode(auth_enum_2.SubjectAuthCodeEnum.BasedOnDefaultAuth);
        }
        const toBeAuthorizedContractIds = new Set();
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);
        const recursionAuthTree = (recursionAuthTreeNodes) => recursionAuthTreeNodes.forEach(resolveResource => {
            resolveResource.contracts.forEach(item => toBeAuthorizedContractIds.add(item.contractId));
            resolveResource.versions.forEach(versionInfo => recursionAuthTree(versionInfo.resolveResources));
        });
        recursionAuthTree(resourceAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds([...toBeAuthorizedContractIds.values()], {
            projection: 'authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));
        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 1, 1);
        if (!lodash_1.isEmpty(resourceResolveAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源自身合约授权未通过')
                .setData({ resourceResolveAuthFailedDependencies })
                .setAuthCode(auth_enum_2.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!lodash_1.isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源上游合约授权未通过')
                .setData({ resourceUpstreamAuthFailedDependencies })
                .setAuthCode(auth_enum_2.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
        }
        return authResult;
    }
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromTreeAuth(authTree, contractMap, startDeep, endDeep) {
        const authFailedDependencies = [];
        const recursionAuth = (toBeAuthorizedResolveResources, deep = 1) => {
            if (deep < startDeep || endDeep > deep) {
                return;
            }
            toBeAuthorizedResolveResources.forEach(item => {
                // 如果versions为空数组,则代表资源解决了上抛,但是后续版本中没有实际使用该资源.则授权过程中忽略掉该上抛资源的实际授权
                if (!lodash_1.isEmpty(item.versions) && !item.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(lodash_1.pick(item, ['resourceId', 'resourceName', 'version']));
                }
                item.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            });
        };
        recursionAuth(authTree);
        return authFailedDependencies;
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "resourceService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "outsideApiService", void 0);
ResourceAuthService = __decorate([
    midway_1.provide()
], ResourceAuthService);
exports.ResourceAuthService = ResourceAuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMsbUNBQThDO0FBQzlDLHFDQUEyQztBQUMzQywrQ0FBa0Q7QUFDbEQsK0NBQW1EO0FBR25ELElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW1CO0lBTzVCLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQXlCLEVBQUUsUUFBNkI7UUFFbEYsTUFBTSxVQUFVLEdBQUcsSUFBSSw2QkFBaUIsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLGdCQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxVQUFVLENBQUMsV0FBVyxDQUFDLCtCQUFtQixDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDOUU7UUFFRCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLHNCQUFlLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUM7UUFDeEgsSUFBSSxDQUFDLGdCQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUM1QixPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDO2lCQUN0QyxPQUFPLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDO2lCQUMzQixXQUFXLENBQUMsK0JBQW1CLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUNoRTtRQUVELE1BQU0sb0JBQW9CLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENB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