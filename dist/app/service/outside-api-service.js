"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutsideApiService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
let OutsideApiService = class OutsideApiService {
    ctx;
    /**
     * 获取文件流
     * @param fileSha1
     */
    async getFileStream(fileSha1) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/download`, null, egg_freelog_base_1.CurlResFormatEnum.Original);
    }
    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     */
    async getFileStorageInfo(fileSha1) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/info`);
    }
    /**
     * 批量签约(已经签过不会重签,合约服务会自动过滤)
     * @param licenseeResourceId
     * @param subjects
     */
    async batchSignResourceContracts(licenseeResourceId, subjects) {
        const postBody = {
            subjectType: egg_freelog_base_1.SubjectTypeEnum.Resource,
            licenseeIdentityType: egg_freelog_base_1.ContractLicenseeIdentityTypeEnum.Resource,
            isWaitInitial: 1,
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
    async createPolicies(policyTexts) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}`, {
            method: 'post', contentType: 'json', data: {
                policyTexts, subjectType: egg_freelog_base_1.SubjectTypeEnum.Resource
            }
        });
    }
    /**
     * 获取资源策略
     * @param policyIds
     * @param projection
     */
    async getResourcePolicies(policyIds, projection = [], isTranslate) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}/list?policyIds=${policyIds.toString()}&subjectType=${egg_freelog_base_1.SubjectTypeEnum.Resource}&projection=${projection.toString()}&isTranslate=${isTranslate ? 1 : 0}`);
    }
    /**
     * 获取资源合约
     * @param contractIds
     * @param options
     */
    async getContractByContractIds(contractIds, options) {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        const tasks = (0, lodash_1.chunk)((0, lodash_1.uniq)(contractIds), 100).map(contractIdChunk => {
            return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}/list?contractIds=${contractIds.toString()}&${optionParams.join('&')}`);
        });
        return Promise.all(tasks).then(results => (0, lodash_1.flatten)(results));
    }
    /**
     * 获取指定乙方与甲方的资源合约
     * @param subjectId (资源体系中标的物ID与甲方ID均为资源ID)
     * @param licenseeId
     * @param options
     */
    async getResourceContracts(subjectId, licenseeId, options) {
        const optionParams = options ? Object.entries(options).map(([key, value]) => `${key}=${value}`) : [];
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfoV2}?identityType=2&subjectId=${subjectId}&licenseeId=${licenseeId}&subjectType=${egg_freelog_base_1.SubjectTypeEnum.Resource}&${optionParams.join('&')}`);
    }
    /**
     * 发送运营活动事件
     * @param taskConfigCode
     * @param userId
     * @param meta
     */
    async sendActivityEvent(taskConfigCode, userId, meta) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.baseUrl}/client/v2/activities/task/records/complete4TaskConfigCode`, {
            method: 'post', contentType: 'json', data: {
                taskConfigCode, userId, meta
            }
        }, egg_freelog_base_1.CurlResFormatEnum.Original).then(response => {
            if (response.status >= 400) {
                console.error(`运营活动调用失败,taskCode:${taskConfigCode}, userId:${userId}`);
            }
        });
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "ctx", void 0);
OutsideApiService = __decorate([
    (0, midway_1.provide)()
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2QyxtQ0FBNEM7QUFFNUMsdURBQXNIO0FBR3RILElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBRzFCLEdBQUcsQ0FBaUI7SUFFcEI7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFnQjtRQUNoQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxVQUFVLFFBQVEsV0FBVyxFQUFFLElBQUksRUFBRSxvQ0FBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuSSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQWdCO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLFVBQVUsUUFBUSxPQUFPLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxrQkFBa0IsRUFBRSxRQUF1QjtRQUN4RSxNQUFNLFFBQVEsR0FBRztZQUNiLFdBQVcsRUFBRSxrQ0FBZSxDQUFDLFFBQVE7WUFDckMsb0JBQW9CLEVBQUUsbURBQWdDLENBQUMsUUFBUTtZQUMvRCxhQUFhLEVBQUUsQ0FBQztZQUNoQixVQUFVLEVBQUUsa0JBQWtCLEVBQUUsUUFBUTtTQUMzQyxDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsWUFBWSxF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