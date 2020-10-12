import {inject, provide} from 'midway';
import {
    ContractInfo, IResourceService, IResourceAuthService,
    ResourceVersionInfo, IOutsideApiService, ResourceAuthTree
} from '../../interface';
import {chain, isArray, pick, isEmpty} from 'lodash';
import {SubjectTypeEnum} from "../../enum";
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

        const toBeAuthorizedContractIds: Set<string> = new Set();
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
    _getAuthFailedResourceFromAuthTree(authTree: ResourceAuthTree[], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number) {
        const authFailedDependencies = [];
        const recursionAuth = (toBeAuthorizedResolveResources: ResourceAuthTree[], deep = 1) => {
            if (deep < startDeep || endDeep > deep) {
                return;
            }
            for (const resolveResource of toBeAuthorizedResolveResources) {
                // 如果versions为空数组,则代表资源解决了上抛,但是后续版本中没有实际使用该资源.则授权过程中忽略掉该上抛资源的实际授权
                if (!isEmpty(resolveResource.versions) && !resolveResource.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(pick(resolveResource, ['resourceId', 'resourceName', 'version']));
                }
                resolveResource.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            }
        }
        recursionAuth(authTree);
        return authFailedDependencies;
    }
}