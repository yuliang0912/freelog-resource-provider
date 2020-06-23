import { CreateResourceOptions, GetResourceDependencyOrAuthTreeOptions, IResourceService, ResourceInfo, ResourceVersionInfo, UpdateResourceOptions } from '../../interface';
export declare class ResourceService implements IResourceService {
    ctx: any;
    resourceProvider: any;
    resourceVersionProvider: any;
    resourcePropertyGenerator: any;
    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;
    /**
     * 更新资源
     * @param {UpdateResourceOptions} options
     * @returns {Promise<ResourceInfo>}
     */
    updateResource(options: UpdateResourceOptions): Promise<ResourceInfo>;
    /**
     * 获取资源依赖树
     * @param {GetResourceDependencyOrAuthTreeOptions} options
     * @returns {Promise<object[]>}
     */
    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<object[]>;
    /**
     * 获取资源授权树
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    getResourceAuthTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<object[]>;
    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames 资源名称集
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    findByResourceNames(resourceNames: string[], ...args: any[]): Promise<ResourceInfo[]>;
    /**
     * 根据资源ID获取资源信息
     * @param {string} resourceId 资源ID
     * @returns {Promise<ResourceInfo>} 资源信息
     */
    findByResourceId(resourceId: string, ...args: any[]): Promise<ResourceInfo>;
    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    findOneByResourceName(resourceName: string, ...args: any[]): Promise<ResourceInfo>;
    /**
     * 根据条件查找单个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    findOne(condition: object, ...args: any[]): Promise<ResourceInfo>;
    /**
     * 根据条件查询多个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    find(condition: object, ...args: any[]): Promise<ResourceInfo[]>;
    /**
     * 分页查找资源
     * @param {object} condition
     * @param {number} page
     * @param {number} pageSize
     * @param {string[]} projection
     * @param {object} orderBy
     * @returns {Promise<ResourceInfo[]>}
     */
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ResourceInfo[]>;
    /**
     * 按条件统计资源数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    count(condition: object): Promise<number>;
    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;
    /**
     * 构建依赖树
     * @param dependencies
     * @param {number} maxDeep
     * @param {number} currDeep
     * @param {any[]} omitFields
     * @returns {Promise<any>}
     * @private
     */
    _buildDependencyTree(dependencies: any, maxDeep?: number, currDeep?: number, omitFields?: any[]): Promise<any[]>;
    /**
     * 从依赖树中获取所有相关的版本信息
     * @param {any[]} dependencyTree
     * @returns {Promise<ResourceVersionInfo[]>}
     * @private
     */
    _getAllVersionInfoFormDependencyTree(dependencyTree: any[]): Promise<ResourceVersionInfo[]>;
    /**
     * 从依赖树中获取指定的所有发行版本(查找多重上抛)
     * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
     * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
     * @param dependencies
     * @param resource
     * @returns {Array}
     * @private
     */
    _findResourceVersionFromDependencyTree(dependencies: any, resource: any, _list?: any[]): object[];
    /**
     * 获取最匹配的semver版本
     * @param resourceVersions
     * @param versionRange
     * @returns {any}
     * @private
     */
    _getResourceMaxSatisfying(resourceVersions: any[], versionRange: string): {
        version: string;
        versionId: string;
    };
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @returns {number} 资源状态
     * @private
     */
    static _getResourceStatus(resourceInfo: ResourceInfo): number;
}
