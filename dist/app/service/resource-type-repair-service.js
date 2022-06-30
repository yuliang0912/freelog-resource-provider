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
let ResourceTypeRepairService = class ResourceTypeRepairService {
    resourceProvider;
    resourceVersionProvider;
    resourceCollectionProvider;
    /**
     * 资源类型数据修复,单字符串改成数组
     */
    async resourceTypeRepair() {
        return this.resourceProvider.find({}, 'resourceType').then(async (list) => {
            for (let resourceInfo of list) {
                const resourceType = resourceInfo.resourceType;
                const resourceId = resourceInfo.resourceId;
                this.resourceProvider.updateOne({ _id: resourceId }, { resourceType }).then();
                this.resourceVersionProvider.updateMany({ resourceId }, { resourceType }).then();
                this.resourceCollectionProvider.updateMany({ resourceId }, { resourceType }).then();
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
ResourceTypeRepairService = __decorate([
    (0, midway_1.provide)()
], ResourceTypeRepairService);
exports.ResourceTypeRepairService = ResourceTypeRepairService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdHlwZS1yZXBhaXItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS10eXBlLXJlcGFpci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUt2QyxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQUVsQyxnQkFBZ0IsQ0FBa0M7SUFFbEQsdUJBQXVCLENBQXlDO0lBRWhFLDBCQUEwQixDQUE0QztJQUV0RTs7T0FFRztJQUNILEtBQUssQ0FBQyxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFO1lBQ3BFLEtBQUssSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO2dCQUMzQixNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDO2dCQUMvQyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO2dCQUMzQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxFQUFDLFVBQVUsRUFBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxFQUFDLFVBQVUsRUFBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNuRjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUFwQkc7SUFEQyxJQUFBLGVBQU0sR0FBRTs7bUVBQ3lDO0FBRWxEO0lBREMsSUFBQSxlQUFNLEdBQUU7OzBFQUN1RDtBQUVoRTtJQURDLElBQUEsZUFBTSxHQUFFOzs2RUFDNkQ7QUFON0QseUJBQXlCO0lBRHJDLElBQUEsZ0JBQU8sR0FBRTtHQUNHLHlCQUF5QixDQXNCckM7QUF0QlksOERBQXlCIn0=