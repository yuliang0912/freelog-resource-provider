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
exports.ResourceCollectionService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
let ResourceCollectionService = class ResourceCollectionService {
    ctx;
    resourceCollectionProvider;
    async collectionResource(model) {
        return this.resourceCollectionProvider.findOneAndUpdate({
            resourceId: model.resourceId, userId: model.userId
        }, model, { new: true }).then(collectionInfo => {
            return collectionInfo || this.resourceCollectionProvider.create(model);
        });
    }
    async isCollected(resourceIds) {
        const condition = {
            userId: this.ctx.userId, resourceId: { $in: resourceIds }
        };
        const collectedResourceSet = await this.resourceCollectionProvider.find(condition, 'resourceId')
            .then(list => new Set(list.map(x => x.resourceId)));
        return resourceIds.map(resourceId => Object({ resourceId, isCollected: collectedResourceSet.has(resourceId) }));
    }
    async find(condition, ...args) {
        return this.resourceCollectionProvider.find(condition, ...args);
    }
    async findOne(condition, ...args) {
        return this.resourceCollectionProvider.findOne(condition, ...args);
    }
    async deleteOne(condition) {
        return this.resourceCollectionProvider.deleteOne(condition).then(ret => ret.ok > 0);
    }
    async count(condition) {
        return this.resourceCollectionProvider.count(condition);
    }
    // 批量查询资源收藏次数
    async countByResourceIds(condition) {
        return this.resourceCollectionProvider.aggregate([
            {
                $match: condition
            },
            {
                $group: { _id: '$resourceId', count: { $sum: 1 } }
            },
            {
                $project: { _id: 0, resourceId: '$_id', count: '$count' }
            }
        ]);
    }
    async findIntervalList(resourceType, omitResourceType, keywords, resourceStatus, skip, limit) {
        const condition = { userId: this.ctx.userId };
        if ((0, lodash_1.isString)(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        }
        else if ((0, lodash_1.isString)(omitResourceType)) {
            condition.resourceType = { $ne: omitResourceType };
        }
        if ((0, lodash_1.isString)(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (/^[0-9a-fA-F]{4,24}$/.test(keywords)) {
                condition.$or = [{ resourceName: searchRegExp }, { resourceId: keywords.toLowerCase() }];
            }
            else {
                condition.resourceName = searchRegExp;
            }
        }
        const resourceMatchAggregates = [{
                $match: {
                    'resourceInfos.status': resourceStatus
                }
            }];
        const collectionMatchAggregates = [{
                $match: condition
            }];
        const joinResourceAggregates = [
            {
                $addFields: { resource_id: { $toObjectId: '$resourceId' } }
            }, {
                $lookup: {
                    from: 'resource-infos',
                    localField: 'resource_id',
                    foreignField: '_id',
                    as: 'resourceInfos'
                }
            }
        ];
        const countAggregates = [{ $count: 'totalItem' }];
        const pageAggregates = [{
                $skip: skip
            }, {
                $limit: limit
            }];
        let countAggregatePipelines;
        let resultAggregatePipelines;
        if ([0, 1].includes(resourceStatus)) {
            countAggregatePipelines = (0, lodash_1.flatten)([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, countAggregates
            ]);
            resultAggregatePipelines = (0, lodash_1.flatten)([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, pageAggregates
            ]);
        }
        else {
            countAggregatePipelines = (0, lodash_1.flatten)([
                collectionMatchAggregates, joinResourceAggregates, countAggregates
            ]);
            resultAggregatePipelines = (0, lodash_1.flatten)([
                collectionMatchAggregates, pageAggregates, joinResourceAggregates
            ]);
        }
        const [totalItemInfo] = await this.resourceCollectionProvider.aggregate(countAggregatePipelines);
        const { totalItem = 0 } = totalItemInfo || {};
        const result = { skip, limit, totalItem, dataList: [] };
        if (totalItem <= skip) {
            return result;
        }
        result.dataList = await this.resourceCollectionProvider.aggregate(resultAggregatePipelines).then(list => list.map(model => {
            const { resourceId, createDate, resourceInfos = [] } = model;
            const resourceInfo = resourceInfos.length ? resourceInfos[0] : {};
            const { resourceName, resourceType, userId, username, coverImages, latestVersion, resourceVersions, updateDate, status } = resourceInfo;
            return {
                resourceId, resourceName, resourceType, coverImages, resourceVersions, latestVersion,
                authorId: userId,
                authorName: username,
                collectionDate: createDate,
                resourceStatus: status,
                resourceUpdateDate: updateDate,
            };
        }));
        return result;
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceCollectionService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceCollectionService.prototype, "resourceCollectionProvider", void 0);
ResourceCollectionService = __decorate([
    (0, midway_1.provide)('resourceCollectionService')
], ResourceCollectionService);
exports.ResourceCollectionService = ResourceCollectionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWNvbGxlY3Rpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsbUNBQXlDO0FBS3pDLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBR2xDLEdBQUcsQ0FBaUI7SUFFcEIsMEJBQTBCLENBQTRDO0lBRXRFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUE2QjtRQUNsRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07U0FDckQsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekMsT0FBTyxjQUFjLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQXFCO1FBQ25DLE1BQU0sU0FBUyxHQUFHO1lBQ2QsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUM7U0FDMUQsQ0FBQztRQUNGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7YUFDM0YsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxD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