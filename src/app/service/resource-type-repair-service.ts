import {inject, provide} from 'midway';
import {IMongodbOperation} from 'egg-freelog-base';
import {CollectionResourceInfo, ResourceInfo, ResourceVersionInfo} from '../../interface';

@provide()
export class ResourceTypeRepairService {
    @inject()
    resourceProvider: IMongodbOperation<ResourceInfo>;
    @inject()
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    @inject()
    resourceCollectionProvider: IMongodbOperation<CollectionResourceInfo>;

    /**
     * 资源类型数据修复,单字符串改成数组
     */
    async resourceTypeRepair() {
        return this.resourceProvider.find({}, 'resourceType').then(async list => {
            for (let resourceInfo of list) {
                const resourceType = resourceInfo.resourceType;
                const resourceId = resourceInfo.resourceId;
                this.resourceVersionProvider.updateMany({resourceId}, {resourceType}).then();
                this.resourceCollectionProvider.updateMany({resourceId}, {resourceType}).then();
            }
        });
    }
}
