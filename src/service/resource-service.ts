import {clean} from 'semver';
import {provide, inject} from 'midway';
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';
import {
    CreateResourceOptions, CreateResourceVersionOptions, GetResourceDependencyOrAuthTreeOptions,
    IResourceService, ResourceInfo, ResourceVersion, UpdateResourceOptions
} from '../interface';

@provide('resourceService')
export class ResourceService implements IResourceService {

    @inject()
    ctx;
    @inject()
    resourceProvider;
    @inject()
    resourceVersionProvider;


    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    async createResource(options: CreateResourceOptions): Promise<ResourceInfo> {

        const resourceInfo: ResourceInfo = {
            resourceName: `${options.username}/${options.name}`,
            resourceType: options.resourceType,
            userId: options.userId,
            username: options.username,
            intro: options.intro,
            coverImages: options.coverImages,
            policies: options.policies,
            resourceVersions: [],
            baseUpcastResources: [],
            status: 0
        };
        resourceInfo.status = ResourceService._getResourceStatus(resourceInfo);
        resourceInfo.uniqueKey = ResourceService._generateResourceUniqueKey(resourceInfo.resourceName);

        return this.resourceProvider.create(resourceInfo);
    }

    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersion>}
     */
    async createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersion> {
        return null;
    }

    /**
     * 更新资源
     * @param {UpdateResourceOptions} options
     * @returns {Promise<ResourceInfo>}
     */
    async updateResource(options: UpdateResourceOptions): Promise<ResourceInfo> {
        return null;
    }

    /**
     * 获取资源依赖树
     * @param {GetResourceDependencyOrAuthTreeOptions} options
     * @returns {Promise<object[]>}
     */
    async getResourceDependencyTree(options: GetResourceDependencyOrAuthTreeOptions): Promise<object[]> {
        return null;
    }

    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    async findOneByResourceName(resourceName: string, ...args): Promise<ResourceInfo> {
        const uniqueKey = ResourceService._generateResourceUniqueKey(resourceName);
        return this.resourceProvider.findOne({uniqueKey}, args);
    }

    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    async findByResourceNames(resourceNames: string[], ...args): Promise<ResourceInfo[]> {
        const uniqueKeys = resourceNames.map(x => ResourceService._generateResourceUniqueKey(x));
        return this.resourceProvider.find({uniqueKey: {$in: uniqueKeys}}, args);
    }

    async findOne(condition: object, ...args): Promise<ResourceInfo> {
        return this.resourceProvider.findOne(condition, args);
    }

    async find(condition: object, ...args): Promise<ResourceInfo[]> {
        return this.resourceProvider.find(condition, args);
    }

    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ResourceInfo[]> {
        return this.resourceProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
    }

    async count(condition: object): Promise<number> {
        return this.resourceProvider.count(condition);
    }

    /**
     * 生成资源版本ID
     * @param resourceId 资源ID
     * @param version 资源版本
     * @returns {string} 资源版本ID
     * @private
     */
    static _generateResourceVersionId(resourceId: string, version: string): string {
        return md5(`${resourceId}-${clean(version)}`);
    }

    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     * @private
     */
    static _generateResourceUniqueKey(resourceName: string): string {
        return md5(`${resourceName.toLowerCase()}}`);
    }

    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @returns {number} 资源状态
     * @private
     */
    static _getResourceStatus(resourceInfo: ResourceInfo): number {
        return resourceInfo.policies.some(x => x['status'] === 1) && resourceInfo.resourceVersions && resourceInfo.resourceVersions.length ? 1 : 0;
    }
}
