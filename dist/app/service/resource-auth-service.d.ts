import { ContractInfo, IResourceService, IResourceAuthService, ResourceVersionInfo, IOutsideApiService, ResourceAuthTree } from '../../interface';
import { SubjectAuthResult } from "../../auth-interface";
export declare class ResourceAuthService implements IResourceAuthService {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    /**
     * 资源授权
     * @param versionInfo
     */
    resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult>;
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     */
    resourceBatchAuth(resourceVersions: ResourceVersionInfo[]): Promise<any[]>;
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult;
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromAuthTree(authTree: ResourceAuthTree[], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number): any[];
}
