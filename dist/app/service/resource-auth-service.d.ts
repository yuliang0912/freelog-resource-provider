import { ContractInfo, IResourceService, IResourceAuthService, ResourceVersionInfo, IOutsideApiService, ResourceAuthTreeNodeInfo } from '../../interface';
import { SubjectAuthResult } from "../../auth-enum";
export declare class ResourceAuthService implements IResourceAuthService {
    resourceService: IResourceService;
    outsideApiService: IOutsideApiService;
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<SubjectAuthResult>;
    /**
     * 资源授权
     * @param versionInfo
     */
    resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult>;
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromTreeAuth(authTree: ResourceAuthTreeNodeInfo[], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number): any[];
}
