import {inject, provide} from 'midway';
import {
    ContractInfo, IResourceService, IResourceAuthService,
    ResourceVersionInfo, IOutsideApiService, ResourceAuthTree, ResourceInfo
} from '../../interface';
import {SubjectTypeEnum} from "../../enum";
import {chain, isArray, isEmpty, first} from 'lodash';
import {SubjectAuthResult, SubjectAuthCodeEnum} from "../../auth-interface";

@provide()
export class ResourceAuthService implements IResourceAuthService {

    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;

    /**
     * 资源授权
     * @param versionInfo
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
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
        }

        return authResult;
    }

    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     */
    async resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'auth' | 'testAuth'): Promise<any[]> {

        const authResultMap = new Map<string, SubjectAuthResult>();
        const allContractIds = chain(resourceVersions).map(x => x.resolveResources).flattenDeep().map(x => x.contracts).flattenDeep().map(x => x.contractId).uniq().value();

        if (!isEmpty(allContractIds)) {
            const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {projection: 'subjectId,subjectType,authStatus'}).then(list => {
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
                const {resourceId, resourceName} = resolveResource;
                const authResult = authResultMap.get(`${resourceVersion.versionId}_${resourceId}`);
                return {
                    resourceId, resourceName, authResult, contractIds: resolveResource.contracts.map(x => x.contractId)
                }
            })
        }));
    }

    /**
     * 资源关系树授权
     * @param versionInfo
     */
    async resourceRelationTreeAuth(versionInfo: ResourceVersionInfo) {

        const options = {maxDeep: 999, omitFields: [], isContainRootNode: true};
        const resourceInfo = {resourceVersions: []} as ResourceInfo; // 减少不必要的数据需求,自行构造一个
        const dependencyTree = await this.resourceService.getResourceDependencyTree(resourceInfo, versionInfo, options);
        const resourceRelationTree = await this.resourceService.getRelationTree(versionInfo, dependencyTree);
        const resourceRelationAuthTree = await this.resourceService.getRelationAuthTree(versionInfo, dependencyTree);

        const allContractIds = this._getContractIdFromResourceAuthTree(resourceRelationAuthTree);
        const contractMap = await this.outsideApiService.getContractByContractIds(allContractIds, {
            projection: 'subjectId,subjectType,authStatus'
        }).then(list => {
            return new Map(list.map(x => [x.contractId, x]));
        });

        for (const item of first(resourceRelationTree).children) {
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
    contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult {

        const authResult = new SubjectAuthResult();
        if (!isArray(contracts) || isEmpty(contracts)) {
            return authResult.setAuthCode(SubjectAuthCodeEnum.SubjectContractNotFound);
        }

        const invalidContracts = contracts.filter(x => x.subjectType !== SubjectTypeEnum.Resource || x.subjectId !== subjectId);
        if (!isEmpty(invalidContracts)) {
            return authResult.setErrorMsg('存在无效的标的物合约')
                .setData({invalidContracts})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractInvalid);
        }

        const isExistAuthContracts = contracts.some(x => (authType === 'auth' ? x.isAuth : x.isTestAuth));
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
        }

        return recursion(authTree, 1, []);
    }

    /**
     * 从授权树中递归获取所有的合同ID
     * @param resourceAuthTree
     * @private
     */
    _getContractIdFromResourceAuthTree(resourceAuthTree: ResourceAuthTree[][]): string[] {

        function recursionPushContractId(authTree: ResourceAuthTree[][], allContractIds: string[]) {
            for (const allResourceVersions of authTree) {
                for (const resourceRelationAuthTree of allResourceVersions) {
                    resourceRelationAuthTree.contracts?.forEach(x => allContractIds.push(x.contractId));
                    recursionPushContractId(resourceRelationAuthTree.children, allContractIds);
                }
            }
            return allContractIds;
        }

        return recursionPushContractId(resourceAuthTree, []);
    }
}