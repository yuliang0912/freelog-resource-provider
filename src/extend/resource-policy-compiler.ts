import {scope, provide} from 'midway';
import {PolicyInfo} from "../interface";
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';

@provide()
@scope('Singleton')
export class ResourcePolicyCompiler {

    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {PolicyInfo}
     */
    compilePolicyText(policyText, policyName): PolicyInfo {
        return {
            policyId: this.generatePolicyId(policyText), policyText, policyName,
            fsmDescriptionInfo: {
                initial: {
                    authorization: [
                        'active', 'presentable'
                    ],
                    transition: {
                        terminate: null
                    }
                }
            }
        };
    }

    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(policyText: string) {
        return md5(policyText.replace(/\s{2,}/g, '').toLowerCase());
    }
}
