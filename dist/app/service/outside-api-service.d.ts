import { SubjectInfo, ContractInfo, IOutsideApiService, PolicyInfo } from '../../interface';
export declare class OutsideApiService implements IOutsideApiService {
    ctx: any;
    /**
     * 获取文件流
     * @param fileSha1
     */
    getFileStream(fileSha1: string): Promise<any>;
    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     * @param resourceType
     */
    getFileObjectProperty(fileSha1: string, resourceType: string): Promise<any>;
    /**
     * 批量签约(已经签过不会重签)
     * @param nodeId
     * @param {SubjectInfo[]} subjects
     * @returns {Promise<ContractInfo[]>}
     */
    batchSignResourceContracts(licenseeResourceId: any, subjects: SubjectInfo[]): Promise<ContractInfo[]>;
    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    getResourcePolicies(policyIds: string[], projection?: string[]): Promise<PolicyInfo[]>;
    /**
     * 获取资源合约
     * @param contractIds
     * @param options
     */
    getResourceContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;
}
