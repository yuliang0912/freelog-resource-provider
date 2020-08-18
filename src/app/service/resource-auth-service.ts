import {inject, provide} from 'midway';
import {
    ContractInfo, IResourceService,
    IResourceAuthService,
    ResourceVersionInfo, IOutsideApiService, ResourceAuthTreeNodeInfo
} from '../../interface';
import {isArray, pick, isEmpty} from 'lodash';
import {SubjectTypeEnum} from "../../enum";

@provide()
export class ResourceAuthService implements IResourceAuthService {

    @inject()
    resourceService: IResourceService;
    @inject()
    outsideApiService: IOutsideApiService;

    async contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean> {
        if (!isArray(contracts) || isEmpty(contracts)) {
            return false;
            // throw new ArgumentError('please check code logic');
        }
        return contracts.some(x => x.subjectId === subjectId && x.subjectType === SubjectTypeEnum.Resource && (authType === 'auth' ? x.isAuth : x.isTestAuth));
    }

    async resourceAuth(versionInfo: ResourceVersionInfo) {

        if (isEmpty(versionInfo.resolveResources)) {
            return true;
        }

        const toBeAuthorizedContractIds: Set<string> = new Set();
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);

        const recursionAuthTree = (recursionAuthTreeNodes) => recursionAuthTreeNodes.forEach(resolveResource => {
            resolveResource.contracts.forEach(item => toBeAuthorizedContractIds.add(item.contractId));
            resolveResource.versions.forEach(versionInfo => recursionAuthTree(versionInfo.resolveResources));
        });
        recursionAuthTree(resourceAuthTree);

        const contractMap = await this.outsideApiService.getResourceContractByContractIds([...toBeAuthorizedContractIds.values()], {
            projection: 'authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));

        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 1, 1);
        if (!isEmpty(resourceResolveAuthFailedDependencies)) {

        }
        const resourceUpstreamAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER);
        if (!isEmpty(resourceUpstreamAuthFailedDependencies)) {

        }
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
                if (!item.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(item);
                }
                item.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            });
        }
        recursionAuth(authTree);
        return authFailedDependencies;
    }

    /**
     * 平铺授权树
     * @param treeTree
     * @private
     */
    _flattenDependencyTree(treeTree: ResourceAuthTreeNodeInfo[]) {

        const flattenAuthTree = [];
        const recursionFillAttribute = (children, parentNid = '', deep = 1) => {
            for (let i = 0, j = children.length; i < j; i++) {
                let model = children[i];
                Object.assign(pick(model, ['resourceId', 'resourceName', 'contracts']), {deep, parentNid});
                flattenAuthTree.push(pick(model, ['resourceId', 'resourceName', 'contracts']))

                // flattenDependencyTree.push(Object.assign(omit(model, ['dependencies']), {deep, parentNid, nid}));
                // recursionFillAttribute(model.dependencies, nid, deep + 1);
            }
        }
        recursionFillAttribute(treeTree);

        return flattenAuthTree;
    }
}