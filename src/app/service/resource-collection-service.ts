import {provide, inject} from 'midway';
import {isString, flatten} from 'lodash';
import {CollectionResourceInfo, ICollectionService} from '../../interface';
import {IMongodbOperation, PageResult, FreelogContext} from 'egg-freelog-base';

@provide('resourceCollectionService')
export class ResourceCollectionService implements ICollectionService {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceCollectionProvider: IMongodbOperation<CollectionResourceInfo>;

    async collectionResource(model: CollectionResourceInfo): Promise<CollectionResourceInfo> {
        return this.resourceCollectionProvider.findOneAndUpdate({
            resourceId: model.resourceId, userId: model.userId
        }, model, {new: true}).then(collectionInfo => {
            return collectionInfo || this.resourceCollectionProvider.create(model);
        });
    }

    async isCollected(resourceIds: string[]): Promise<Array<{ resourceId: string, isCollected: boolean }>> {
        const condition = {
            userId: this.ctx.userId, resourceId: {$in: resourceIds}
        };
        const collectedResourceSet = await this.resourceCollectionProvider.find(condition, 'resourceId')
            .then(list => new Set(list.map(x => x.resourceId)));
        return resourceIds.map(resourceId => Object({resourceId, isCollected: collectedResourceSet.has(resourceId)}));
    }

    async find(condition: object, ...args): Promise<CollectionResourceInfo[]> {
        return this.resourceCollectionProvider.find(condition, ...args);
    }

    async findOne(condition: object, ...args): Promise<CollectionResourceInfo> {
        return this.resourceCollectionProvider.findOne(condition, ...args);
    }

    async deleteOne(condition: object): Promise<boolean> {
        return this.resourceCollectionProvider.deleteOne(condition).then(ret => ret.ok > 0);
    }

    async count(condition: object): Promise<number> {
        return this.resourceCollectionProvider.count(condition);
    }

    // 批量查询资源收藏次数
    async countByResourceIds(condition: object): Promise<Array<{ resourceId: number, count: number }>> {
        return this.resourceCollectionProvider.aggregate([
            {
                $match: condition
            },
            {
                $group: {_id: '$resourceId', count: {$sum: 1}}
            },
            {
                $project: {_id: 0, resourceId: '$_id', count: '$count'}
            }
        ]);
    }

    async findIntervalList(resourceType: string, omitResourceType: string, keywords: string, resourceStatus: number, skip: number, limit: number): Promise<PageResult<CollectionResourceInfo>> {
        const condition: any = {userId: this.ctx.userId};
        if (isString(resourceType)) { // resourceType 与 omitResourceType互斥
            condition.resourceType = new RegExp(`^${resourceType}$`, 'i');
        } else if (isString(omitResourceType)) {
            condition.resourceType = {$ne: omitResourceType};
        }
        if (isString(keywords) && keywords.length > 0) {
            const searchRegExp = new RegExp(keywords, 'i');
            if (/^[0-9a-fA-F]{4,24}$/.test(keywords)) {
                condition.$or = [{resourceName: searchRegExp}, {resourceId: keywords.toLowerCase()}];
            } else {
                condition.resourceName = searchRegExp;
            }
        }

        const resourceMatchAggregates: any[] = [{
            $match: {
                'resourceInfos.status': resourceStatus
            }
        }];
        const collectionMatchAggregates: any[] = [{
            $match: condition
        }];
        const joinResourceAggregates: any[] = [
            {
                $addFields: {resource_id: {$toObjectId: '$resourceId'}}
            }, {
                $lookup: {
                    from: 'resource-infos',
                    localField: 'resource_id',
                    foreignField: '_id',
                    as: 'resourceInfos'
                }
            }];
        const countAggregates: any[] = [{$count: 'totalItem'}];
        const pageAggregates: any[] = [{
            $skip: skip
        }, {
            $limit: limit
        }];

        let countAggregatePipelines: any[];
        let resultAggregatePipelines: any[];
        if ([0, 1].includes(resourceStatus)) {
            countAggregatePipelines = flatten([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, countAggregates
            ]);
            resultAggregatePipelines = flatten([
                collectionMatchAggregates, joinResourceAggregates, resourceMatchAggregates, pageAggregates
            ]);
        } else {
            countAggregatePipelines = flatten([
                collectionMatchAggregates, joinResourceAggregates, countAggregates
            ]);
            resultAggregatePipelines = flatten([
                collectionMatchAggregates, pageAggregates, joinResourceAggregates
            ]);
        }

        const [totalItemInfo] = await this.resourceCollectionProvider.aggregate(countAggregatePipelines);
        const {totalItem = 0} = totalItemInfo || {};
        const result: PageResult<CollectionResourceInfo> = {skip, limit, totalItem, dataList: []};
        if (totalItem <= skip) {
            return result;
        }

        result.dataList = await this.resourceCollectionProvider.aggregate(resultAggregatePipelines).then(list => list.map(model => {
            const {resourceId, createDate, resourceInfos = []} = model;
            const resourceInfo: any = resourceInfos.length ? resourceInfos[0] : {};
            const {resourceName, resourceType, userId, username, coverImages, latestVersion, resourceVersions, updateDate, status} = resourceInfo;
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
}
