import {inject, provide} from 'midway';
import {
    ContractInfo, IResourceService, IResourceAuthService,
    ResourceVersionInfo, IOutsideApiService, ResourceAuthTree, ResourceInfo, ResourceDependencyTree
} from '../../interface';
import {chain, isArray, isEmpty, first, uniqBy} from 'lodash';
import {SubjectAuthResult} from '../../auth-interface';
import {SubjectAuthCodeEnum, SubjectTypeEnum} from 'egg-freelog-base';

@provide()
export class ResourceAuthService implements IResourceAuthService {

    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;

    /**
     * 资源授权
     * @param versionInfo
     * @param isIncludeUpstreamAuth
     */
    async resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult> {

        const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.BasedOnContractAuthorized);
        if (isEmpty(versionInfo.resolveResources)) {
            return authResult.setAuthCode(SubjectAuthCodeEnum.BasedOnDefaultAuth);
        }

        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));

        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 1, 1);
        if (!isEmpty(resourceResolveAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源自身合约授权未通过')
                .setData({resourceResolveAuthFailedDependencies})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }

        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源上游合约授权未通过')
                .setData({resourceUpstreamAuthFailedDependencies})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized)
                .setErrorMsg('资源上游合约授权未通过');
        }

        return authResult;
    }

    /**
     * 资源上游授权(不包含自身)
     * @param resourceAuthTree
     */
    async resourceUpstreamAuth(resourceAuthTree: ResourceAuthTree[][]): Promise<SubjectAuthResult> {

        const authResult = new SubjectAuthResult(SubjectAuthCodeEnum.BasedOnContractAuthorized);
        const allContractIds = this._getContractIdFromResourceAuthTree(resourceAuthTree, 2);

        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));

        const resourceUpstreamAuthFailedDependencies = this._getAuthFailedResourceFromAuthTree(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER);
        if (isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult;
        }

        return authResult.setErrorMsg('资源上游合约授权未通过')
            .setData({resourceUpstreamAuthFailedDependencies})
            .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
    }

    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     * @param authType
     */
    async resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'auth' | 'testAuth'): Promise<any[]> {

        const authResultMap = new Map<string, SubjectAuthResult>();
        const allContractIds = chain(resourceVersions).map(x => x.resolveResources).flattenDeep().map(x => x.contracts).flattenDeep().map(x => x.contractId).uniq().value();

        const contractMap = new Map<string, ContractInfo>();
        if (!isEmpty(allContractIds)) {
            await this.outsideApiService.getContractByContractIds(allContractIds, {projection: 'subjectId,subjectType,authStatus'}).then(list => {
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
                const {resourceId, resourceName} = resolveResource;
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
    async resourceRelationTreeAuth(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo) {

        const options = {maxDeep: 999, omitFields: [], isContainRootNode: true};
        const dependencyTree = await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options).then(first);
        const flattenResourceDependencyTree = (dependencyTree: ResourceDependencyTree[], list: ResourceDependencyTree[] = []) => {
            for (const dependencyInfo of dependencyTree) {
                list.push(dependencyInfo, ...flattenResourceDependencyTree(dependencyInfo.dependencies));
            }
            return list;
        };
        const authCheck = (dependencyTree: ResourceDependencyTree[]) => {
            const authFailedResources = [];
            for (const item of dependencyTree) {
                const contracts = item.resolveResources.map(x => x.contracts).flat().map(x => contractMap.get(x.contractId));
                if (!this.contractAuth(item.resourceId, contracts, 'auth').isAuth) {
                    authFailedResources.push(item);
                }
            }
            return authFailedResources;
        };

        const flattenList: ResourceDependencyTree[] = flattenResourceDependencyTree([dependencyTree]);
        const allContractIds = chain(flattenList).map(x => x.resolveResources.map(m => m.contracts)).flattenDeep().map(x => x.contractId).value();
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {projection: 'subjectId,subjectType,authStatus'}).then(list => {
            return new Map(list.map(x => [x.contractId, x]));
        });

        const resourceTypeMap = new Map<string, string[]>();
        const resourceIds = dependencyTree.dependencies?.map(dependency => dependency.baseUpcastResources.map(x => x.resourceId)).flat();
        if (!isEmpty(resourceIds)) {
            await this.resourceService.find({_id: {$in: resourceIds}}, '_id resourceType').then(list => {
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

            const dependRelationTree: any = {
                resourceId: dependency.resourceId,
                resourceName: dependency.resourceName,
                resourceType: dependency.resourceType,
                versionRanges: [dependency.versionRange],
                versions: [dependency.version],
                versionIds: [dependency.versionId],
                isUpcast: resourceInfo.baseUpcastResources.some(x => x.resourceId === dependency.resourceId),
                children: []
            };

            const subDependencyAuthTree = isEmpty(dependency.resolveResources) ? [] : this.resourceService.findResourceVersionFromDependencyTree(dependencyTree.dependencies, dependency.resourceId);
            const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subDependencyAuthTree).filter(x => !isEmpty(x.resolveResources));

            const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
            // 下游(根资源)解决当前资源所使用的合约ID.
            dependRelationTree.downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === dependency.resourceId)?.contracts ?? [];
            // 如果根资源没有解决此依赖,则依然设置为true. UI上一般来说true不显示任何标记. false会显示授权异常.
            dependRelationTree.downstreamIsAuth = !versionInfo.resolveResources.some(x => x.resourceId === dependency.resourceId) || this.contractAuth(dependency.resourceId, dependRelationTree.downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
            dependRelationTree.selfAndUpstreamIsAuth = isEmpty(selfAndUpstreamResolveResources) || isEmpty(selfAndUpstreamAuthFailedResources);

            for (const upcast of dependency.baseUpcastResources) {

                const downstreamAuthContractIds = versionInfo.resolveResources.find(x => x.resourceId === upcast.resourceId)?.contracts ?? [];
                // 跟资源对上抛是否就地解决. 如果没有解决或者已解决且授权通过,则为true.
                const downstreamIsAuth = !versionInfo.resolveResources.find(x => x.resourceId === upcast.resourceId) || this.contractAuth(upcast.resourceId, downstreamAuthContractIds.map(x => contractMap.get(x.contractId)), 'auth').isAuth;
                const subUpcastAuthTree = this.resourceService.findResourceVersionFromDependencyTree(dependency.dependencies, upcast.resourceId).filter(x => !isEmpty(x.resolveResources));
                const selfAndUpstreamResolveResources = flattenResourceDependencyTree(subUpcastAuthTree).filter(x => !isEmpty(x.resolveResources));
                const selfAndUpstreamAuthFailedResources = authCheck(selfAndUpstreamResolveResources);
                const selfAndUpstreamIsAuth = isEmpty(selfAndUpstreamResolveResources) || isEmpty(selfAndUpstreamAuthFailedResources);

                const resolveVersions = uniqBy(subUpcastAuthTree, 'versionId');
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
    contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult {

        const authResult = new SubjectAuthResult();
        if (!isArray(contracts) || isEmpty(contracts)) {
            return authResult.setAuthCode(SubjectAuthCodeEnum.SubjectContractNotFound);
        }

        const invalidContracts = contracts.filter(x => x?.subjectType !== SubjectTypeEnum.Resource || x?.subjectId !== subjectId);
        if (!isEmpty(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({invalidContracts})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractInvalid);
        }

        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : (x.isAuth || x.isTestAuth)));
        if (!isExistAuthContracts) {
            return authResult.setErrorMsg('合约授权未通过')
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }

        return authResult.setAuthCode(SubjectAuthCodeEnum.BasedOnContractAuthorized);
    }

    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromAuthTree(authTree: ResourceAuthTree[][], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number) {

        const recursion = (list: ResourceAuthTree[][], deep: number = 1, authFailedResources: any[]) => {
            if (deep < startDeep || deep > endDeep) {
                return authFailedResources;
            }
            for (const allVersionResources of list) {
                const resourceInfo = first(allVersionResources);
                if (isEmpty(resourceInfo.contracts ?? [])) {
                    continue;
                }
                const authResult = this.contractAuth(resourceInfo.resourceId, resourceInfo.contracts.map(x => contractMap.get(x.contractId)), 'auth');
                if (!authResult.isAuth) {
                    const contractIds = deep === 1 ? resourceInfo.contracts.map(x => x.contractId) : [];
                    allVersionResources.forEach(x => authFailedResources.push({
                        resourceId: resourceInfo.resourceId, version: x.version, deep, contractIds
                    })); // 当deep=1时,可以考虑把contractId展示出来.需要看前端有没有直接执行合约的需求
                }
                for (const {children} of allVersionResources) {
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
    _getContractIdFromResourceAuthTree(resourceAuthTree: ResourceAuthTree[][], startDeep: number = 1, endDeep: number = Number.MAX_SAFE_INTEGER): string[] {

        function recursionPushContractId(authTree: ResourceAuthTree[][], allContractIds: string[], deep: number = 1) {
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
}
