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
    async findPageList(resourceType, keywords, resourceStatus, page, pageSize) {
        const condition = { userId: this.ctx.userId };
        if (resourceType) {
            condition.resourceType = resourceType;
        }
        if (lodash_1.isString(keywords) && keywords.length > 0) {
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
                $skip: (page - 1) * pageSize
            }, {
                $limit: pageSize
            }];
        let countAggregatePipelines;
        let resultAggregatePipelines;
        if ([0, 1].includes(resourceStatus)) {
            countAggregatePipelines = lodash_1.flatten([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, countAggregates
            ]);
            resultAggregatePipelines = lodash_1.flatten([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, pageAggregates
            ]);
        }
        else {
            countAggregatePipelines = lodash_1.flatten([
                collectionMatchAggregates, joinResourceAggregates, countAggregates
            ]);
            resultAggregatePipelines = lodash_1.flatten([
                collectionMatchAggregates, pageAggregates, joinResourceAggregates
            ]);
        }
        const [totalItemInfo] = await this.resourceCollectionProvider.aggregate(countAggregatePipelines);
        const { totalItem = 0 } = totalItemInfo || {};
        const result = { page, pageSize, totalItem, dataList: [] };
        if (totalItem <= (page - 1) * pageSize) {
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
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceCollectionService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceCollectionService.prototype, "resourceCollectionProvider", void 0);
ResourceCollectionService = __decorate([
    midway_1.provide('resourceCollectionService')
], ResourceCollectionService);
exports.ResourceCollectionService = ResourceCollectionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWNvbGxlY3Rpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsbUNBQXlDO0FBS3pDLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBT2xDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUE2QjtRQUNsRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07U0FDckQsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekMsT0FBTyxjQUFjLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQXFCO1FBQ25DLE1BQU0sU0FBUyxHQUFHO1lBQ2QsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUM7U0FDMUQsQ0FBQztRQUNGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7YUFDM0YsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENB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