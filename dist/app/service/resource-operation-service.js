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
exports.ResourceOperationService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
let ResourceOperationService = class ResourceOperationService {
    ctx;
    resourceProvider;
    resourceOperationProvider;
    /**
     * 创建资源运营类数据
     * @param type
     * @param resourceList
     * @param attachData
     */
    async createResourceOperationDatas(type, resourceList, attachData) {
        const existingSet = await this.resourceOperationProvider.find({ resourceId: resourceList.map(x => x.resourceId) }, 'resourceId').then(list => {
            return new Set(list.map(x => x.resourceId));
        });
        const list = [];
        for (let resourceInfo of resourceList) {
            if (!existingSet.has(resourceInfo.resourceId)) {
                list.push({
                    type,
                    resourceId: resourceInfo.resourceId,
                    resourceName: resourceInfo.resourceName,
                    resourceType: resourceInfo.resourceType,
                    authorId: resourceInfo.userId,
                    authorName: resourceInfo.username,
                    createUserId: this.ctx.userId
                });
            }
        }
        if ((0, lodash_1.isEmpty)(list)) {
            return true;
        }
        return this.resourceOperationProvider.insertMany(list);
    }
    /**
     * 删除资源运营类数据
     * @param type
     * @param resourceList
     */
    async deleteResourceOperationDatas(type, resourceList) {
        if ((0, lodash_1.isEmpty)(resourceList)) {
            return false;
        }
        return this.resourceOperationProvider.deleteMany({
            type, resourceId: {
                $in: resourceList.map(x => x.resourceId)
            }
        }).then(x => Boolean(x.ok));
    }
    /**
     * 分页查找资源
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    async findIntervalList(condition, skip, limit, projection, sort) {
        return this.resourceOperationProvider.findIntervalList(condition, skip, limit, projection?.toString(), sort);
    }
    /**
     * 关联搜索
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    async findIntervalListJoinResource(condition, skip, limit, projection, sort) {
        const pipelines = [{
                $addFields: {
                    resource_id: { $toObjectId: '$resourceId' }
                }
            }, {
                $lookup: {
                    from: 'resource-infos',
                    localField: 'resource_id',
                    foreignField: '_id',
                    as: 'resourceInfo'
                }
            }, {
                $unwind: {
                    path: '$resourceInfo'
                }
            }, {
                $match: condition
            }, {
                $sort: sort
            }];
        const [totalItemInfo] = await this.resourceOperationProvider.aggregate(pipelines.concat([{ $count: 'totalItem' }]));
        const { totalItem = 0 } = totalItemInfo || {};
        const result = { skip, limit, totalItem, dataList: [] };
        if (totalItem <= skip) {
            return result;
        }
        result.dataList = await this.resourceOperationProvider.aggregate(pipelines.concat([{
                $skip: skip
            }, {
                $limit: limit
            }]));
        return result;
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceOperationService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceOperationService.prototype, "resourceProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceOperationService.prototype, "resourceOperationProvider", void 0);
ResourceOperationService = __decorate([
    (0, midway_1.provide)('resourceOperationService')
], ResourceOperationService);
exports.ResourceOperationService = ResourceOperationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utb3BlcmF0aW9uLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvcmVzb3VyY2Utb3BlcmF0aW9uLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXVDO0FBR3ZDLG1DQUErQjtBQUcvQixJQUFhLHdCQUF3QixHQUFyQyxNQUFhLHdCQUF3QjtJQUdqQyxHQUFHLENBQWlCO0lBRXBCLGdCQUFnQixDQUFrQztJQUVsRCx5QkFBeUIsQ0FBeUI7SUFFbEQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsNEJBQTRCLENBQUMsSUFBWSxFQUFFLFlBQTRCLEVBQUUsVUFBbUI7UUFDOUYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkksT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxJQUFJLFlBQVksSUFBSSxZQUFZLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNOLElBQUk7b0JBQ0osVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO29CQUNuQyxZQUFZLEVBQUUsWUFBWSxDQUFDLFlBQVk7b0JBQ3ZDLFlBQVksRUFB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