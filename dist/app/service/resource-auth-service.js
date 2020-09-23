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
const auth_interface_1 = require("../../auth-interface");
let ResourceAuthService = class ResourceAuthService {
    /**
     * 资源授权
     * @param versionInfo
     */
    async resourceAuth(versionInfo, isIncludeUpstreamAuth) {
        const authResult = new auth_interface_1.SubjectAuthResult(auth_interface_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
        if (lodash_1.isEmpty(versionInfo.resolveResources)) {
            return authResult.setAuthCode(auth_interface_1.SubjectAuthCodeEnum.BasedOnDefaultAuth);
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
        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 1, 1);
        if (!lodash_1.isEmpty(resourceResolveAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源自身合约授权未通过')
                .setData({ resourceResolveAuthFailedDependencies })
                .setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!lodash_1.isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源上游合约授权未通过')
                .setData({ resourceUpstreamAuthFailedDependencies })
                .setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
        }
        return authResult;
    }
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     */
    async resourceBatchAuth(resourceVersions) {
        const authResultMap = new Map();
        const allContractIds = lodash_1.chain(resourceVersions).map(x => x.resolveResources).flattenDeep().map(x => x.contracts).flattenDeep().map(x => x.contractId).uniq().value();
        if (!lodash_1.isEmpty(allContractIds)) {
            const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(list => {
                return new Map(list.map(x => [x.contractId, x]));
            });
            for (const resourceVersion of resourceVersions) {
                for (const resolveResource of resourceVersion.resolveResources) {
                    const contracts = resolveResource.contracts.map(x => contractMap.get(x.contractId));
                    const authResult = this.contractAuth(resolveResource.resourceId, contracts, 'auth');
                    authResultMap.set(`${resourceVersion.versionId}_${resolveResource.resourceId}`, authResult);
                }
            }
        }
        return resourceVersions.map(resourceVersion => Object({
            resourceId: resourceVersion.resourceId,
            resourceName: resourceVersion.resourceName,
            versionId: resourceVersion.versionId,
            version: resourceVersion.version,
            resolveResourceAuthResults: resourceVersion.resolveResources.map(resolveResource => {
                const { resourceId, resourceName } = resolveResource;
                const authResult = authResultMap.get(`${resourceVersion.versionId}_${resourceId}`);
                return {
                    resourceId, resourceName, authResult, contractIds: resolveResource.contracts.map(x => x.contractId)
                };
            })
        }));
    }
    contractAuth(subjectId, contracts, authType) {
        const authResult = new auth_interface_1.SubjectAuthResult();
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            return authResult.setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        const invalidContracts = contracts.filter(x => x.subjectType !== enum_1.SubjectTypeEnum.Resource || x.subjectId !== subjectId);
        if (!lodash_1.isEmpty(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({ invalidContracts })
                .setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractInvalid);
        }
        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : x.isTestAuth));
        if (!isExistAuthContracts) {
            return authResult.setErrorMsg('合约授权未通过')
                .setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        return authResult.setAuthCode(auth_interface_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
    }
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromAuthTree(authTree, contractMap, startDeep, endDeep) {
        const authFailedDependencies = [];
        const recursionAuth = (toBeAuthorizedResolveResources, deep = 1) => {
            if (deep < startDeep || endDeep > deep) {
                return;
            }
            for (const resolveResource of toBeAuthorizedResolveResources) {
                // 如果versions为空数组,则代表资源解决了上抛,但是后续版本中没有实际使用该资源.则授权过程中忽略掉该上抛资源的实际授权
                if (!lodash_1.isEmpty(resolveResource.versions) && !resolveResource.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(lodash_1.pick(resolveResource, ['resourceId', 'resourceName', 'version']));
                }
                resolveResource.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMsbUNBQXFEO0FBQ3JELHFDQUEyQztBQUMzQyx5REFBNEU7QUFHNUUsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFPNUI7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFnQyxFQUFFLHFCQUE4QjtRQUUvRSxNQUFNLFVBQVUsR0FBRyxJQUFJLGtDQUFpQixDQUFDLG9DQUFtQixDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDeEYsSUFBSSxnQkFBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQ0FBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsTUFBTSx5QkFBeUIsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVyRixNQUFNLGlCQUFpQixHQUFHLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNuRyxlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMxRixlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7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