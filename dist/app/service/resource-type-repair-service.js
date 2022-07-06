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
exports.ResourceTypeRepairService = void 0;
const midway_1 = require("midway");
const outside_api_service_1 = require("./outside-api-service");
const lodash_1 = require("lodash");
let ResourceTypeRepairService = class ResourceTypeRepairService {
    resourceProvider;
    resourceVersionProvider;
    resourceCollectionProvider;
    outsideApiService;
    resourceTypeMap = new Map([
        ['theme', ['主题']],
        ['widget', ['插件']],
        ['reveal_slide', ['演示文稿']],
        ['novel', ['阅读', '文章']],
        ['txt', ['阅读', '文章']],
        ['markdown', ['阅读', '文章']],
        ['image', ['图片']],
        ['comic', ['图片']],
        ['video', ['视频']],
        ['audio', ['音频']],
    ]);
    /**
     * 资源类型数据修复,单字符串改成数组
     */
    async resourceTypeRepair() {
        return this.resourceProvider.find({}, 'resourceType').then(async (list) => {
            for (let resourceInfo of list) {
                let resourceType = resourceInfo.resourceType;
                const resourceId = resourceInfo.resourceId;
                for (let [key, value] of this.resourceTypeMap) {
                    if (resourceType.includes(key)) {
                        resourceType.splice(resourceType.indexOf(key), 1, ...value);
                    }
                }
                resourceType = (0, lodash_1.uniq)(resourceType);
                this.resourceProvider.updateOne({ _id: resourceId }, { resourceType }).then();
                this.resourceVersionProvider.updateMany({ resourceId }, { resourceType }).then();
                this.resourceCollectionProvider.updateMany({ resourceId }, { resourceType }).then();
            }
        });
    }
    /**
     * 资源meta修复
     */
    async resourceMetaRepair() {
        this.resourceVersionProvider.find({}).then(list => {
            for (let resourceVersionInfo of list) {
                this.outsideApiService.getFileStorageInfo(resourceVersionInfo.fileSha1).then(fileStorageInfo => {
                    if (fileStorageInfo?.metaInfo) {
                        this.resourceVersionProvider.updateOne({ versionId: resourceVersionInfo.versionId }, {
                            systemProperty: fileStorageInfo.metaInfo
                        });
                    }
                });
            }
        });
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "resourceProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "resourceVersionProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceTypeRepairService.prototype, "resourceCollectionProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", outside_api_service_1.OutsideApiService)
], ResourceTypeRepairService.prototype, "outsideApiService", void 0);
ResourceTypeRepairService = __decorate([
    (0, midway_1.provide)()
], ResourceTypeRepairService);
exports.ResourceTypeRepairService = ResourceTypeRepairService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdHlwZS1yZXBhaXItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS10eXBlLXJlcGFpci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUd2QywrREFBd0Q7QUFDeEQsbUNBQTRCO0FBRzVCLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBRWxDLGdCQUFnQixDQUFrQztJQUVsRCx1QkFBdUIsQ0FBeUM7SUFFaEUsMEJBQTBCLENBQTRDO0lBRXRFLGlCQUFpQixDQUFvQjtJQUVyQyxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQW1CO1FBQ3hDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0lBRUg7O09BRUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtZQUNwRSxLQUFLLElBQUksWUFBWSxJQUFJLElBQUksRUFBRTtnQkFDM0IsSUFBSSxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztnQkFDN0MsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQzNDLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDNUIsWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO3FCQUMvRDtpQkFDSjtnQkFDRCxZQUFZLEdBQUcsSUFBQSxhQUFJLEVBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLEVBQUUsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUUsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM3RSxJQUFJLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUUsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ25GO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlDLEtBQUssSUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBQzNGLElBQUksZUFBZSxFQUFFLFFBQVEsRUFBRTt3QkFDM0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUMsRUFBRTs0QkFDL0UsY0FBYyxFQUFFLGVBQWUsQ0FBQyxRQUFRO3lCQUMzQyxDQUFDLENBQUM7cUJBQ047Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUExREc7SUFEQyxJQUFBLGVBQU0sR0FBRTs7bUVBQ3lDO0FBRWxEO0lBREMsSUFBQSxlQUFNLEdBQUU7OzBFQUN1RDtBQUVoRTtJQURDLElBQUEsZUFBTSxHQUFFOzs2RUFDNkQ7QUFFdEU7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDVSx1Q0FBaUI7b0VBQUM7QUFSNUIseUJBQXlCO0lBRHJDLElBQUEsZ0JBQU8sR0FBRTtHQUNHLHlCQUF5QixDQTREckM7QUE1RFksOERBQXlCIn0=