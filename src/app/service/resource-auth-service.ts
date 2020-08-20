import {inject, provide} from 'midway';
import {
    ContractInfo, IResourceService, IResourceAuthService,
    ResourceVersionInfo, IOutsideApiService, ResourceAuthTreeNodeInfo
} from '../../interface';
import {isArray, pick, isEmpty} from 'lodash';
import {SubjectTypeEnum} from "../../enum";
import {SubjectAuthResult} from "../../auth-enum";
import {SubjectAuthCodeEnum} from '../../auth-enum'

@provide()
export class ResourceAuthService implements IResourceAuthService {

    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;

    async contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<SubjectAuthResult> {

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

        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 1, 1);
        if (!isEmpty(resourceResolveAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源自身合约授权未通过')
                .setData({resourceResolveAuthFailedDependencies})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized);
        }

        const resourceUpstreamAuthFailedDependencies = isIncludeUpstreamAuth ? this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER) : [];
        if (!isEmpty(resourceUpstreamAuthFailedDependencies)) {
            return authResult.setErrorMsg('资源上游合约授权未通过')
                .setData({resourceUpstreamAuthFailedDependencies})
                .setAuthCode(SubjectAuthCodeEnum.SubjectContractUnauthorized).setErrorMsg('资源上游合约授权未通过');
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
    _getAuthFailedResourceFromTreeAuth(authTree: ResourceAuthTreeNodeInfo[], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number) {
        const authFailedDependencies = [];
        const recursionAuth = (toBeAuthorizedResolveResources: ResourceAuthTreeNodeInfo[], deep = 1) => {
            if (deep < startDeep || endDeep > deep) {
                return;
            }
            toBeAuthorizedResolveResources.forEach(item => {
                // 如果versions为空数组,则代表资源解决了上抛,但是后续版本中没有实际使用该资源.则授权过程中忽略掉该上抛资源的实际授权
                if (!isEmpty(item.versions) && !item.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(pick(item, ['resourceId', 'resourceName', 'version']));
                }
                item.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            });
        }
        recursionAuth(authTree);
        return authFailedDependencies;
    }
}