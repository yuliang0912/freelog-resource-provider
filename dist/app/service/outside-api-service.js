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
const enum_1 = require("../../enum");
let OutsideApiService = class OutsideApiService {
    /**
     * 获取文件流
     * @param fileSha1
     * @param filename
     */
    async getFileStream(fileSha1) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/download`, {
            dataType: 'original'
        });
    }
    /**
     * 分析与获取文件系统属性
     * @param fileSha1
     * @param resourceType
     */
    async getFileObjectProperty(fileSha1, resourceType) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.storageInfo}/files/${fileSha1}/property?resourceType=${resourceType}`);
    }
    /**
     * 批量签约(已经签过不会重签)
     * @param nodeId
     * @param {SubjectInfo[]} subjects
     * @returns {Promise<ContractInfo[]>}
     */
    async batchSignResourceContracts(licenseeResourceId, subjects) {
        const postBody = {
            subjectType: enum_1.SubjectTypeEnum.Resource,
            licenseeIdentityType: enum_1.IdentityType.Resource,
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
    async getResourcePolicies(policyIds, projection = []) {
        return this.ctx.curlIntranetApi(`${this.ctx.webApi.policyInfoV2}/list?policyIds=${policyIds.toString()}&subjectType=${enum_1.SubjectTypeEnum.Resource}&projection=${projection.toString()}`);
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], OutsideApiService.prototype, "ctx", void 0);
OutsideApiService = __decorate([
    midway_1.provide()
], OutsideApiService);
exports.OutsideApiService = OutsideApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0c2lkZS1hcGktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9vdXRzaWRlLWFwaS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUN2QyxxQ0FBeUQ7QUFJekQsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBaUI7SUFLMUI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBZ0I7UUFDaEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsVUFBVSxRQUFRLFdBQVcsRUFBRTtZQUN6RixRQUFRLEVBQUUsVUFBVTtTQUN2QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFnQixFQUFFLFlBQW9CO1FBQzlELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLFVBQVUsUUFBUSwwQkFBMEIsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUM5SCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQUMsa0JBQWtCLEVBQUUsUUFBdUI7UUFDeEUsTUFBTSxRQUFRLEdBQUc7WUFDYixXQUFXLEVBQUUsc0JBQWUsQ0FBQyxRQUFRO1lBQ3JDLG9CQUFvQixFQUFFLG1CQUFZLENBQUMsUUFBUTtZQUMzQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsUUFBUTtTQUMzQyxDQUFDO1FBQ0YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsWUFBWSxFQUFFO1lBQzNFLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUTtTQUN0RCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFtQixFQUFFLGFBQXVCLEVBQUU7UUFDcEUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksbUJBQW1CLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLHNCQUFlLENBQUMsUUFBUSxlQUFlLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUwsQ0FBQztDQUNKLENBQUE7QUEvQ0c7SUFEQyxlQUFNLEVBQUU7OzhDQUNMO0FBSEssaUJBQWlCO0lBRDdCLGdCQUFPLEVBQUU7R0FDRyxpQkFBaUIsQ0FrRDdCO0FBbERZLDhDQUFpQiJ9