import {inject, provide} from 'midway';
import {chunk, flatten, uniq} from 'lodash';
import {BasePolicyInfo, ContractInfo, IOutsideApiService, SubjectInfo} from '../../interface';
import {FreelogContext, ContractLicenseeIdentityTypeEnum, CurlResFormatEnum, SubjectTypeEnum} from 'egg-freelog-base';

@provide()
export class OutsideApiService implements IOutsideApiService {

    @inject()
    ctx: FreelogContext;

    /**
     * 获取文件流
     * @param fileSha1
     */
    async getFileStream(fileSha1: string): Promise<any> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/download`, null, CurlResFormatEnum.OriginalData);
    }

    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     * @param resourceType
     */
    async getFileObjectProperty(fileSha1: string, resourceType: string) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/property?resourceType=${resourceType}`);
    }

    /**
     * 批量签约(已经签过不会重签,合约服务会自动过滤)
     * @param licenseeResourceId
     * @param subjects
     */
    async batchSignResourceContracts(licenseeResourceId, subjects: SubjectInfo[]): Promise<ContractInfo[]> {
        const postBody = {
            subjectType: SubjectTypeEnum.Resource,
            licenseeIdentityType: ContractLicenseeIdentityTypeEnum.Resource,
            licenseeId: licenseeResourceId, subjects
        };
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}/batchSign`, {
            method: 'post', contentType: 'json', data: postBody
        });
    }

    /**
     * 批量创建策略
     * @param policyTexts
     */
    async createPolicies(policyTexts: string[]): Promise<BasePolicyInfo[]> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}`, {
            method: 'post', contentType: 'json', data: {
                policyTexts, subjectType: SubjectTypeEnum.Resource
            }
        });
    }

    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    async getResourcePolicies(policyIds: string[], projection: string[] = []): Promise<BasePolicyInfo[]> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}/list?policyIds=${policyIds.toString()}&subjectType=${SubjectTypeEnum.Resource}&projection=${projection.toString()}`);
    }

    /**
     * 获取资源合约
     * @param contractIds
     * @param options
     */
    async getContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]> {

        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        const tasks = chunk(uniq(contractIds), 100).map(contractIdChunk => {
            return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}/list?contractIds=${contractIds.toString()}&${optionParams.join('&')}`);
        });

        return Promise.all(tasks).then(results => flatten(results));
    }

    /**
     * 获取指定乙方与甲方的资源合约
     * @param subjectId (资源体系中标的物ID与甲方ID均为资源ID)
     * @param licenseeId
     * @param options
     */
    async getResourceContracts(subjectId: string, licenseeId: string | number, options?: object): Promise<ContractInfo[]> {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}?identityType=2&subjectId=${subjectId}&licenseeId=${licenseeId}&subjectType=${SubjectTypeEnum.Resource}&${optionParams.join('&')}`)
    }
}
