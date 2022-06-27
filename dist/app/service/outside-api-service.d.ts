import { BasePolicyInfo, ContractInfo, IOutsideApiService, SubjectInfo } from '../../interface';
import { FreelogContext } from 'egg-freelog-base';
export declare class OutsideApiService implements IOutsideApiService {
    ctx: FreelogContext;
    /**
     * 获取文件流
     * @param fileSha1
     */
    getFileStream(fileSha1: string): Promise<any>;
    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     */
    getFileStorageInfo(fileSha1: string): Promise<any>;
    /**
     * 批量签约(已经签过不会重签,合约服务会自动过滤)
     * @param licenseeResourceId
     * @param subjects
     */
    batchSignResourceContracts(licenseeResourceId: any, subjects: SubjectInfo[]): Promise<ContractInfo[]>;
    /**
     * 批量创建策略
     * @param policyTexts
     */
    createPolicies(policyTexts: string[]): Promise<BasePolicyInfo[]>;
    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    getResourcePolicies(policyIds: string[], projection?: string[], isTranslate?: boolean): Promise<BasePolicyInfo[]>;
    /**
     * 获取资源合约
     * @param contractIds
     * @param options
     */
    getContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;
    /**
     * 获取指定乙方与甲方的资源合约
     * @param subjectId (资源体系中标的物ID与甲方ID均为资源ID)
     * @param licenseeId
     * @param options
     */
    getResourceContracts(subjectId: string, licenseeId: string | number, options?: object): Promise<ContractInfo[]>;
}
