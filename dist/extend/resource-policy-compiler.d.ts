import { PolicyInfo } from "../interface";
export declare class ResourcePolicyCompiler {
    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {PolicyInfo}
     */
    compilePolicyText(policyText: any, policyName: any): PolicyInfo;
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(policyText: string): any;
}
