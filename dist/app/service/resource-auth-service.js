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
    resourceService;
    outsideApiService;
    /**
     * 资源授权
     * @param versionInfo
     * @param isIncludeUpstreamAuth
     */
    async resourceAuth(versionInfo, isIncludeUpstreamAuth) {
        const authResult = new auth_interface_1.SubjectAuthResult(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnContractAuthorized);
        if ((0, lodash_1.isEmpty)(versionInfo.resolveResources)) {
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.BasedOnDefaultAuth);
        }
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));
        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 1, 1);
        if (!(0, lodash_1.isEmpty)(resourceResolveAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源自身合约授权未通过')
                .setData({ resourceResolveAuthFailedDependencies })
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }
        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!(0, lodash_1.isEmpty)(resourceUpstreamAuthFailedDependencies)) {
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
        if ((0, lodash_1.isEmpty)(resourceUpstreamAuthFailedDependencies)) {
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
        const allContractIds = (0, lodash_1.chain)(resourceVersions).map(x => x.resolveResources).flattenDeep().map(x => x.contracts).flattenDeep().map(x => x.contractId).uniq().value();
        const contractMap = new Map();
        if (!(0, lodash_1.isEmpty)(allContractIds)) {
            await this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(list => {
                list.forEach(x => contractMap.set(x.contractId, x));
            });
        }
        for (const resourceVersion of resourceVersions) {
            for (const resolveResource of resourceVersion.resolveResources) {
                const contracts = resolveResource.contracts.map(x => contractMap.get(x.contractId));
                const authResult = this.contractAuth(resolveResource.resourceId, contracts, authType);
                authResultMap.set(`${resourceVersion.versionId}_${resolveResource.resourceId}`, authResult);
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
     * 资源关系树
     * @param resourceInfo
     * @param versionInfo
     */
    async resourceRelationTreeAuth(resourceInfo, versionInfo) {
        const options = { maxDeep: 999, omitFields: [], isContainRootNode: true };
        const dependencyTree = await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options).then(lodash_1.first);
        const flattenResourceDependencyTree = (dependencyTree, list = []) => {
            for (const dependencyInfo of dependencyTree) {
                list.push(dependencyInfo, ...flattenResourceDependencyTree(dependencyInfo.dependencies));
            }
            return list;
        };
        const authCheck = (dependencyTree) => {
            const authFailedResources = [];
            for (const item of dependencyTree) {
                const contracts = item.resolveResources.map(x => x.contracts).flat().map(x => contractMap.get(x.contractId));
                if (!this.contractAuth(item.resourceId, contracts, 'auth').isAuth) {
                    authFailedResources.push(item);
                }
            }
            return authFailedResources;
        };
        const flattenList = flattenResourceDependencyTree([dependencyTree]);
        const allContractIds = (0, lodash_1.chain)(flattenList).map(x => x.resolveResources.map(m => m.contracts)).flattenDeep().map(x => x.contractId).value();
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(list => {
            return new Map(list.map(x => [x.contractId, x]));
        });
        const resourceTypeMap = new Map();
        const resourceIds = dependencyTree.dependencies?.map(dependency => dependency.baseUpcastResources.map(x => x.resourceId)).flat();
        if (!(0, lodash_1.isEmpty)(resourceIds)) {
            await this.resourceService.find({ _id: { $in: resourceIds } }, '_id resourceType').then(list => {
                list.forEach(x => resourceTypeMap.set(x.resourceId, x.resourceType));
            });
        }
        const relationTree = {
            resourceId: versionInfo.resourceId,
            resourceName: versionInfo.resourceName,
            resourceType: versionInfo.resourceType,
            versionRanges: [],
            versions: [versionInfo.version],
            versionIds: [versionInfo.versionId],
            children: []
        };
        for (const dependency of dependencyTree.dependencies) {
            const dependRelationTree = {
                resourceId: dependency.resourceId,
                resourceName: dependency.resourceName,
                resourceType: dependency.resourceType,
                versionRanges: [dependency.versionRange],
                versions: [dependency.version],
                versionIds: [dependency.versionId],
                isUpcast: resourceInfo.baseUpcastResources.some(x => x.resourceId === dependency.resourceId),
                children: []
            };
            const subDependencyAuthTree = (0, lodash_1.isEmpty)(dependency.resolveResources) ? [] : this.resourceService.findResourceVersionFromDependencyTree(dependencyTree.dependencies, dependency.resourceId);
            const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subDependencyAuthTree).filter(x => !(0, lodash_1.isEmpty)(x.resolveResources));
            const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
            dependRelationTree.downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === dependency.resourceId)?.contracts ?? [];
            dependRelationTree.downstreamIsAuth = (0, lodash_1.isEmpty)(dependRelationTree.downstreamAuthContractIds) || this.contractAuth(dependency.resourceId, dependRelationTree.downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
            dependRelationTree.selfAndUpstreamIsAuth = (0, lodash_1.isEmpty)(selfAndUpstreamResolveResources) || (0, lodash_1.isEmpty)(selfAndUpstreamAuthFailedResources);
            for (const upcast of dependency.baseUpcastResources) {
                const downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === upcast.resourceId)?.contracts ?? [];
                const downstreamIsAuth = (0, lodash_1.isEmpty)(downstreamAuthContractIds) || this.contractAuth(upcast.resourceId, downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
                const subUpcastAuthTree = this.resourceService.findResourceVersionFromDependencyTree(dependency.dependencies, upcast.resourceId).filter(x => !(0, lodash_1.isEmpty)(x.resolveResources));
                const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subUpcastAuthTree).filter(x => !(0, lodash_1.isEmpty)(x.resolveResources));
                const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
                const selfAndUpstreamIsAuth = (0, lodash_1.isEmpty)(selfAndUpstreamResolveResources) || (0, lodash_1.isEmpty)(selfAndUpstreamAuthFailedResources);
                const resolveVersions = (0, lodash_1.uniqBy)(subUpcastAuthTree, 'versionId');
                const upcastRelationTree = {
                    resourceId: upcast.resourceId,
                    resourceName: upcast.resourceName,
                    resourceType: resourceTypeMap.get(upcast.resourceId),
                    versionRanges: resolveVersions.map(x => x.versionRange),
                    versions: resolveVersions.map(x => x.version),
                    versionIds: resolveVersions.map(x => x.versionId),
                    isUpcast: resourceInfo.baseUpcastResources.some(x => x.resourceId === upcast.resourceId),
                    downstreamIsAuth, selfAndUpstreamIsAuth, downstreamAuthContractIds,
                    children: []
                };
                dependRelationTree.children.push(upcastRelationTree);
            }
            relationTree.children.push(dependRelationTree);
        }
        return [relationTree];
    }
    /**
     * 合同授权
     * @param subjectId
     * @param contracts
     * @param authType
     */
    contractAuth(subjectId, contracts, authType) {
        const authResult = new auth_interface_1.SubjectAuthResult();
        if (!(0, lodash_1.isArray)(contracts) || (0, lodash_1.isEmpty)(contracts)) {
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        const invalidContracts = contracts.filter(x => x?.subjectType !== egg_freelog_base_1.SubjectTypeEnum.Resource || x?.subjectId !== subjectId);
        if (!(0, lodash_1.isEmpty)(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({ invalidContracts })
                .setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractInvalid);
        }
        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : (x.isAuth || x.isTestAuth)));
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
                const resourceInfo = (0, lodash_1.first)(allVersionResources);
                if ((0, lodash_1.isEmpty)(resourceInfo.contracts ?? [])) {
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
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "outsideApiService", void 0);
ResourceAuthService = __decorate([
    (0, midway_1.provide)()
], ResourceAuthService);
exports.ResourceAuthService = ResourceAuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMsbUNBQThEO0FBQzlELHlEQUF1RDtBQUN2RCx1REFBc0U7QUFHdEUsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFHNUIsZUFBZSxDQUFtQjtJQUVsQyxpQkFBaUIsQ0FBcUI7SUFFdEM7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBZ0MsRUFBRSxxQkFBOEI7UUFFL0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxzQ0FBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3hGLElBQUksSUFBQSxnQkFBTyxFQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxzQ0FBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsd0JBQXdCLENBQUMsY0FBYyxFQUFFO1lBQ3RGLFVBQVUsRUFBRSxrQ0FBa0M7U0FDakQsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FB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