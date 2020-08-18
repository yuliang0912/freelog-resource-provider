import { ContractInfo, IResourceService, IResourceAuthService, ResourceVersionInfo, IOutsideApiService, ResourceAuthTreeNodeInfo } from '../../interface';
export declare class ResourceAuthService implements IResourceAuthService {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean>;
    resourceAuth(versionInfo: ResourceVersionInfo): Promise<boolean>;
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromTreeAuth(authTree: ResourceAuthTreeNodeInfo[], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number): any[];
    /**
     * 平铺授权树
     * @param treeTree
     * @private
     */
    _flattenDependencyTree(treeTree: ResourceAuthTreeNodeInfo[]): any[];
}
