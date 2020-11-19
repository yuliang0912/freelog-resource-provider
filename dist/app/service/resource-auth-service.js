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
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
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