import {inject, provide} from 'midway';
import {FreelogContext, IMongodbOperation, PageResult} from 'egg-freelog-base';
import {CollectionResourceInfo, ResourceInfo} from '../../interface';
import {isEmpty} from 'lodash';

@provide('resourceOperationService')
export class ResourceOperationService {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceProvider: IMongodbOperation<ResourceInfo>;
    @inject()
    resourceOperationProvider: IMongodbOperation<any>;

    /**
     * 创建资源运营类数据
     * @param type
     * @param resourceList
     * @param attachData
     */
    async createResourceOperationDatas(type: number, resourceList: ResourceInfo[], attachData?: object) {
        const existingSet = await this.resourceOperationProvider.find({resourceId: resourceList.map(x => x.resourceId)}, 'resourceId').then(list => {
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
        if (isEmpty(list)) {
            return true;
        }
        return this.resourceOperationProvider.insertMany(list);
    }

    /**
     * 删除资源运营类数据
     * @param type
     * @param resourceList
     */
    async deleteResourceOperationDatas(type: number, resourceList: ResourceInfo[]) {
        if (isEmpty(resourceList)) {
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
    async findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<any>> {
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
    async findIntervalListJoinResource(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<any>> {

        const pipelines = [{
            $addFields: {
                resource_id: {$toObjectId: '$resourceId'}
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

        const [totalItemInfo] = await this.resourceOperationProvider.aggregate(pipelines.concat([{$count: 'totalItem'}] as any));
        const {totalItem = 0} = totalItemInfo || {};
        const result: PageResult<CollectionResourceInfo> = {skip, limit, totalItem, dataList: []};
        if (totalItem <= skip) {
            return result;
        }
        result.dataList = await this.resourceOperationProvider.aggregate(pipelines.concat([{
            $skip: skip
        }, {
            $limit: limit
        }] as any));
        return result;
    }
}
