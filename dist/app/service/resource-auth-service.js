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
const enum_1 = require("../../enum");
const lodash_1 = require("lodash");
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
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
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
     * 资源上游授权(不包含自身)
     * @param resourceAuthTree
     */
    async resourceUpstreamAuth(resourceAuthTree) {
        const authResult = new auth_interface_1.SubjectAuthResult(auth_interface_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree, 2);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));
        const resourceUpstreamAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER);
        if (lodash_1.isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult;
        }
        return authResult.setErrorMsg('资源上游合约授权未通过')
            .setData({ resourceUpstreamAuthFailedDependencies })
            .setAuthCode(auth_interface_1.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
    }
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     */
    async resourceBatchAuth(resourceVersions, authType) {
        const authResultMap = new Map();
        const allContractIds = lodash_1.chain(resourceVersions).map(x => x.resolveResources).flattenDeep().map(x => x.contracts).flattenDeep().map(x => x.contractId).uniq().value();
        if (!lodash_1.isEmpty(allContractIds)) {
            const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(list => {
                return new Map(list.map(x => [x.contractId, x]));
            });
            for (const resourceVersion of resourceVersions) {
                for (const resolveResource of resourceVersion.resolveResources) {
                    const contracts = resolveResource.contracts.map(x => contractMap.get(x.contractId));
                    const authResult = this.contractAuth(resolveResource.resourceId, contracts, authType);
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
    /**
     * 资源关系树授权
     * @param versionInfo
     */
    async resourceRelationTreeAuth(versionInfo) {
        const options = { maxDeep: 999, omitFields: [], isContainRootNode: true };
        const resourceInfo = { resourceVersions: [] }; // 减少不必要的数据需求,自行构造一个
        const dependencyTree = await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options);
        const resourceRelationTree = await this.resourceService.getRelationTree(versionInfo, dependencyTree);
        const resourceRelationAuthTree = await this.resourceService.getRelationAuthTree(versionInfo, dependencyTree);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceRelationAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => {
            return new Map(list.map(x => [x.contractId, x]));
        });
        const rootResource = lodash_1.first(resourceRelationTree);
        rootResource['authFailedResources'] = [];
        for (const item of rootResource.children) {
            const authTree = resourceRelationAuthTree.filter(x => x.some(m => m.resourceId === item.resourceId));
            item['authFailedResources'] = this._getAuthFailedResourceFromAuthTree(authTree, contractMap, 1, Number.MAX_SAFE_INTEGER);
        }
        return resourceRelationTree;
    }
    /**
     * 合同授权
     * @param subjectId
     * @param contracts
     * @param authType
     */
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
        const recursion = (list, deep = 1, authFailedResources) => {
            if (deep < startDeep || deep > endDeep) {
                return authFailedResources;
            }
            for (const allVersionResources of list) {
                const resourceInfo = lodash_1.first(allVersionResources);
                if (lodash_1.isEmpty(resourceInfo.contracts ?? [])) {
                    continue;
                }
                const authResult = this.contractAuth(resourceInfo.resourceId, resourceInfo.contracts.map(x => contractMap.get(x.contractId)), 'auth');
                if (!authResult.isAuth) {
                    const contractIds = deep === 1 ? resourceInfo.contracts.map(x => x.contractId) : [];
                    allVersionResources.forEach(x => authFailedResources.push({
                        resourceId: resourceInfo.resourceId, version: x.version, deep, contractIds
                    })); // 当deep=1时,可以考虑把contractId展示出来.需要看前端有没有直接执行合约的需求
                }
                for (const { children } of allVersionResources) {
                    recursion(children, deep + 1, authFailedResources);
                }
            }
            return authFailedResources;
        };
        return recursion(authTree, 1, []);
    }
    /**
     * 从授权树中递归获取所有的合同ID
     * @param resourceAuthTree
     * @private
     */
    _getContractIdFromResourceAuthTree(resourceAuthTree, startDeep = 1, endDeep = Number.MAX_SAFE_INTEGER) {
        function recursionPushContractId(authTree, allContractIds, deep = 1) {
            if (deep < startDeep || deep > endDeep) {
                return allContractIds;
            }
            for (const allResourceVersions of authTree) {
                for (const resourceRelationAuthTree of allResourceVersions) {
                    resourceRelationAuthTree.contracts?.forEach(x => allContractIds.push(x.contractId));
                    recursionPushContractId(resourceRelationAuthTree.children, allContractIds, deep + 1);
                }
            }
            return allContractIds;
        }
        return recursionPushContractId(resourceAuthTree, [], 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMscUNBQTJDO0FBQzNDLG1DQUFzRDtBQUN0RCx5REFBNEU7QUFHNUUsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFPNUI7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFnQyxFQUFFLHFCQUE4QjtRQUUvRSxNQUFNLFVBQVUsR0FBRyxJQUFJLGtDQUFpQixDQUFDLG9DQUFtQixDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDeEYsSUFBSSxnQkFBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQ0FBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsd0JBQXdCLENBQUMsY0FBYyxFQUFFO1lBQ3RGLFVBQVUsRUFBRSxrQ0FBa0M7U0FDakQsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxxQ0FBcUMsR0FBRyxJQUFJLENB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