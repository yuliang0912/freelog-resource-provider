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
            userId: this.ctx.request.userId, resourceId: { $in: resourceIds }
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
    async findPageList(resourceType, keywords, resourceStatus, page, pageSize) {
        const condition = { userId: this.ctx.request.userId };
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
        let countAggregatePipelines = [];
        let resultAggregatePipelines = [];
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
        result.dataList = await this.resourceCollectionProvider.aggregate(resultAggregatePipelines).map(model => {
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
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWNvbGxlY3Rpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsbUNBQXlDO0FBSXpDLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBT2xDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUE2QjtRQUNsRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07U0FDckQsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekMsT0FBTyxjQUFjLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQXFCO1FBQ25DLE1BQU0sU0FBUyxHQUFHO1lBQ2QsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFDO1NBQ2xFLENBQUM7UUFDRixNQUFNLG9CQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO2FBQzNGLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENB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