import {provide, inject} from 'midway';
import {IdentityType, SubjectTypeEnum} from '../../enum';
import {SubjectInfo, ContractInfo, IOutsideApiService, PolicyInfo} from '../../interface';

@provide()
export class OutsideApiService implements IOutsideApiService {

    @inject()
    ctx;

    /**
     * 获取文件流
     * @param fileSha1
     * @param filename
     */
    async getFileStream(fileSha1: string): Promise<any> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/download`, {
            dataType: 'original'
        });
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
     * 批量签约(已经签过不会重签)
     * @param nodeId
     * @param {SubjectInfo[]} subjects
     * @returns {Promise<ContractInfo[]>}
     */
    async batchSignResourceContracts(licenseeResourceId, subjects: SubjectInfo[]): Promise<ContractInfo[]> {
        const postBody = {
            subjectType: SubjectTypeEnum.Resource,
            licenseeIdentityType: IdentityType.Resource,
            licenseeId: licenseeResourceId, subjects
        };
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}/batchSign`, {
            method: 'post', contentType: 'json', data: postBody
        });
    }

    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    async getResourcePolicies(policyIds: string[], projection: string[] = []): Promise<PolicyInfo[]> {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}/list?policyIds=${policyIds.toString()}&subjectType=${SubjectTypeEnum.Resource}&projection=${projection.toString()}`);
    }

    async getResourceContractByContractIds(contractIds: string[], options?: object) {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}/list?contractIds=${contractIds.toString()}&subjectType=${SubjectTypeEnum.Resource}&${optionParams.join('&')}`)
    }

    // async getResourceContracts(subjectId: string, licensorId: string, licenseeId: string | number)
}