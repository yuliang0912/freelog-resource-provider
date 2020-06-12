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
let ResourceCollectionService = /** @class */ (() => {
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
                const { resourceName, resourceType, policies, userId, username, coverImages, resourceVersions, updateDate, status } = resourceInfo;
                return {
                    resourceId, resourceName, resourceType, policies, coverImages, resourceVersions,
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
    return ResourceCollectionService;
})();
exports.ResourceCollectionService = ResourceCollectionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWNvbGxlY3Rpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsbUNBQXlDO0FBSXpDO0lBQUEsSUFBYSx5QkFBeUIsR0FBdEMsTUFBYSx5QkFBeUI7UUFPbEMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQTZCO1lBQ2xELE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLGdCQUFnQixDQUFDO2dCQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07YUFDckQsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ3pDLE9BQU8sY0FBYyxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFxQjtZQUNuQyxNQUFNLFNBQVMsR0FBRztnQkFDZCxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUM7YUFDbEUsQ0FBQztZQUNGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7aUJBQzNGLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFB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