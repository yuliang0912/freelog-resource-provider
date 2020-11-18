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
     * 资源上游授权(不包含自身)
     * @param resourceAuthTree
     */
    resourceUpstreamAuth(resourceAuthTree: ResourceAuthTree[][]): Promise<SubjectAuthResult>;
    /**
     * 资源批量授权,不调用授权树,直接对比合约状态
     * @param resourceVersions
     * @param authType
     */
    resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'auth' | 'testAuth'): Promise<any[]>;
    /**
     * 资源关系树授权
     * @param versionInfo
     */
    resourceRelationTreeAuth(versionInfo: ResourceVersionInfo): Promise<any[]>;
    /**
     * 合同授权
     * @param subjectId
     * @param contracts
     * @param authType
     */
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult;
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromAuthTree(authTree: ResourceAuthTree[][], contractMap: Map<string, ContractInfo>, startDeep: number, endDeep: number): any[];
    /**
     * 从授权树中递归获取所有的合同ID
     * @param resourceAuthTree
     * @param startDeep
     * @param endDeep
     */
    _getContractIdFromResourceAuthTree(resourceAuthTree: ResourceAuthTree[][], startDeep?: number, endDeep?: number): string[];
}
