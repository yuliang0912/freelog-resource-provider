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
const auth_interface_1 = require("../../auth-interface");
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceAuthService = class ResourceAuthService {
    /**
     * 资源授权
     * @param versionInfo
     * @param isIncludeUpstreamAuth
     */
    async resourceAuth(versionInfo, isIncludeUpstreamAuth) {
        const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
        if (lodash_1.isEmpty(versionInfo.resolveResources)) {
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnDefaultAuth);
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
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!lodash_1.isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源上游合约授权未通过')
                .setData({ resourceUpstreamAuthFailedDependencies })
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized)
                .setErrorMsg('资源上游合约授权未通过');
        }
        return authResult;
    }
    /**
     * 资源上游授权(不包含自身)
     * @param resourceAuthTree
     */
    async resourceUpstreamAuth(resourceAuthTree) {
        const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
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
            .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
    }
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     * @param authType
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
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        const invalidContracts = contracts.filter(x => x.subjectType !== egg_freelog_base_1.SubjectTypeEnum.Resource || x.subjectId !== subjectId);
        if (!lodash_1.isEmpty(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({ invalidContracts })
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractInvalid);
        }
        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : x.isTestAuth));
        if (!isExistAuthContracts) {
            return authResult.setErrorMsg('合约授权未通过')
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
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
     * @param startDeep
     * @param endDeep
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMsbUNBQXNEO0FBQ3RELHlEQUF1RDtBQUN2RCx1REFBc0U7QUFHdEUsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFPNUI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBZ0MsRUFBRSxxQkFBOEI7UUFFL0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxzQ0FBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3hGLElBQUksZ0JBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUN2QyxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsc0NBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUN6RTtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRTtZQUN0RixVQUFVLEVBQUUsa0NBQWtDO1NBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNELE1BQU0scUNBQXFDLEdBQUcsSUFBSSxD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