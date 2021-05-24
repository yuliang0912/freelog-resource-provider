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
     * @param resourceInfo
     * @param versionInfo
     */
    // async resourceRelationTreeAuth(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo) {
    //     this.test(resourceInfo, versionInfo);
    //     const options = {maxDeep: 999, omitFields: [], isContainRootNode: true};
    //     // const resourceInfo = {resourceVersions: []} as ResourceInfo; // 减少不必要的数据需求,自行构造一个
    //     const dependencyTree = await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options);
    //     const resourceRelationTree = await this.resourceService.getRelationTree(versionInfo, dependencyTree);
    //     const resourceRelationAuthTree = await this.resourceService.getRelationAuthTree(versionInfo, dependencyTree);
    //
    //     const allContractIds = this._getContractIdFromResourceAuthTree(resourceRelationAuthTree);
    //     allContractIds.push(...versionInfo.resolveResources.map(x => x.contracts.map(x => x.contractId)).flat());
    //
    //     const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {projection: 'subjectId,subjectType,authStatus'}).then(list => {
    //         return new Map(list.map(x => [x.contractId, x]));
    //     });
    //
    //     const rootResource = first(resourceRelationTree);
    //     // 只判定资源的依赖的授权结果(包括上游整个授权链)
    //     for (const dependResource of rootResource.children) {
    //         const resolveDependResource = versionInfo.resolveResources.find(x => x.resourceId === dependResource.resourceId);
    //         // 根资源解决依赖(也可以解决直接上抛)
    //         dependResource['selfAuthContracts'] = resolveDependResource?.contracts ?? [];
    //         dependResource['selfIsAuth'] = resolveDependResource ? this.contractAuth(dependResource.resourceId, resolveDependResource.contracts.map(x => contractMap.get(x.contractId)), 'auth').isAuth : true;
    //
    //         // const dependResourceDependencyTree = first(dependencyTree).dependencies.find(x => x.resourceId === dependResource.resourceId);
    //
    //         // 上游资源授权(如果没解决其他资源,则授权通过)
    //         const dependResourceAuthTree = resourceRelationAuthTree.filter(x => x.some(m => m.resourceId === dependResource.resourceId));
    //         const authFailedResources = this._getAuthFailedResourceFromAuthTree(dependResourceAuthTree, contractMap, 1, Number.MAX_SAFE_INTEGER);
    //         dependResource['upstreamIsAuth'] = isEmpty(dependResource.resolveResources) || isEmpty(authFailedResources);
    //         for (const upcastResource of dependResource.children) {
    //             const resolveUpcastResource = versionInfo.resolveResources.find(x => x.resourceId === upcastResource.resourceId);
    //             upcastResource['selfAuthContracts'] = resolveUpcastResource?.contracts ?? [];
    //             upcastResource['selfIsAuth'] = resolveUpcastResource ? this.contractAuth(dependResource.resourceId, resolveUpcastResource.contracts.map(x => contractMap.get(x.contractId)), 'auth').isAuth : true;
    //             const upcastResourceAuthTree = resourceRelationAuthTree.filter(x => x.some(m => m.resourceId === upcastResource.resourceId));
    //             const authFailedResources = this._getAuthFailedResourceFromAuthTree(upcastResourceAuthTree, contractMap, 1, Number.MAX_SAFE_INTEGER);
    //             upcastResource['upstreamIsAuth'] = isEmpty(upcastResource.resolveResources) || isEmpty(authFailedResources);
    //         }
    //     }
    //     return resourceRelationTree;
    // }
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
        const allContractIds = lodash_1.chain(flattenList).map(x => x.resolveResources.map(m => m.contracts)).flattenDeep().map(x => x.contractId).value();
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, { projection: 'subjectId,subjectType,authStatus' }).then(list => {
            return new Map(list.map(x => [x.contractId, x]));
        });
        const resourceTypeMap = new Map();
        const resourceIds = dependencyTree.dependencies?.map(dependency => dependency.baseUpcastResources.map(x => x.resourceId)).flat();
        if (!lodash_1.isEmpty(resourceIds)) {
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
                children: []
            };
            const subDependencyAuthTree = lodash_1.isEmpty(dependency.resolveResources) ? [] : this.resourceService.findResourceVersionFromDependencyTree(dependencyTree.dependencies, dependency.resourceId);
            const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subDependencyAuthTree).filter(x => !lodash_1.isEmpty(x.resolveResources));
            const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
            dependRelationTree.downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === dependency.resourceId)?.contracts ?? [];
            dependRelationTree.downstreamIsAuth = lodash_1.isEmpty(dependRelationTree.downstreamAuthContractIds) || this.contractAuth(dependency.resourceId, dependRelationTree.downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
            dependRelationTree.selfAndUpstreamIsAuth = lodash_1.isEmpty(selfAndUpstreamResolveResources) || lodash_1.isEmpty(selfAndUpstreamAuthFailedResources);
            for (const upcast of dependency.baseUpcastResources) {
                const downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === upcast.resourceId)?.contracts ?? [];
                const downstreamIsAuth = lodash_1.isEmpty(downstreamAuthContractIds) || this.contractAuth(upcast.resourceId, downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
                const subUpcastAuthTree = this.resourceService.findResourceVersionFromDependencyTree(dependency.dependencies, upcast.resourceId).filter(x => !lodash_1.isEmpty(x.resolveResources));
                const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subUpcastAuthTree).filter(x => !lodash_1.isEmpty(x.resolveResources));
                const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
                const selfAndUpstreamIsAuth = lodash_1.isEmpty(selfAndUpstreamResolveResources) || lodash_1.isEmpty(selfAndUpstreamAuthFailedResources);
                const resolveVersions = lodash_1.uniqBy(subUpcastAuthTree, 'versionId');
                const upcastRelationTree = {
                    resourceId: upcast.resourceId,
                    resourceName: upcast.resourceName,
                    resourceType: resourceTypeMap.get(upcast.resourceId),
                    versionRanges: resolveVersions.map(x => x.versionRange),
                    versions: resolveVersions.map(x => x.version),
                    versionIds: resolveVersions.map(x => x.versionId),
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
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            return authResult.setAuthCode(egg_freelog_base_1.SubjectAuthCodeEnum.SubjectContractNotFound);
        }
        const invalidContracts = contracts.filter(x => x?.subjectType !== egg_freelog_base_1.SubjectTypeEnum.Resource || x?.subjectId !== subjectId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFLdkMsbUNBQThEO0FBQzlELHlEQUF1RDtBQUN2RCx1REFBc0U7QUFHdEUsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFPNUI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBZ0MsRUFBRSxxQkFBOEI7UUFFL0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxzQ0FBbUIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3hGLElBQUksZ0JBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUN2QyxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsc0NBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUN6RTtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLHdCQUF3QixDQUFDLGNBQWMsRUFBRTtZQUN0RixVQUFVLEVBQUUsa0NBQWtDO1NBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNELE1BQU0scUNBQXFDLEdBQUcsSUFBSSxD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