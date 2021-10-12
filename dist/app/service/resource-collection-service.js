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