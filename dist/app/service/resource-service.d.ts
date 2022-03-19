import { FreelogContext, IMongodbOperation, PageResult } from 'egg-freelog-base';
import { CreateResourceOptions, GetResourceDependencyOrAuthTreeOptions, IOutsideApiService, IResourceService, PolicyInfo, ResourceInfo, ResourceVersionInfo, UpdateResourceOptions, IResourceVersionService, ResourceAuthTree, ResourceDependencyTree, BaseResourceInfo, operationPolicyInfo, ResourceTagInfo } from '../../interface';
export declare class ResourceService implements IResourceService {
    ctx: FreelogContext;
    resourceProvider: IMongodbOperation<ResourceInfo>;
    resourceTagProvider: IMongodbOperation<ResourceTagInfo>;
    resourceFreezeRecordProvider: IMongodbOperation<any>;
    resourcePropertyGenerator: any;
    outsideApiService: IOutsideApiService;
    resourceVersionService: IResourceVersionService;
    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;
    /**
     * 更新资源
     * @param resourceInfo
     * @param options
     */
    updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo>;
    /**
     * 获取资源依赖树
     * @param resourceInfo
     * @param versionInfo
     * @param options
     */
    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<ResourceDependencyTree[]>;
    /**
     * 获取资源授权树
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    getResourceAuthTree(versionInfo: ResourceVersionInfo): Promise<ResourceAuthTree[][]>;
    /**
     * 依赖树转换成授权树
     * @param dependencyTree
     */
    getResourceAuthTreeFromDependencyTree(dependencyTree: ResourceDependencyTree[]): ResourceAuthTree[][];
    /**
     * 获取关系树(资源=>资源的依赖=>依赖的上抛,最多三层)
     * @param versionInfo
     * @param dependencyTree
     */
    getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]>;
    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames 资源名称集
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    findByResourceNames(resourceNames: string[], ...args: any[]): Promise<ResourceInfo[]>;
    /**
     * 根据资源ID获取资源信息
     * @param resourceId
     * @param args
     */
    findByResourceId(resourceId: string, ...args: any[]): Promise<ResourceInfo>;
    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    findOneByResourceName(resourceName: string, ...args: any[]): Promise<ResourceInfo>;
    findUserCreatedResourceCounts(userIds: number[]): Promise<any>;
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
    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ResourceInfo>>;
    /**
     * 按条件统计资源数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    count(condition: object): Promise<number>;
    /**
     * 冻结或解封资源
     * @param resourceInfo
     * @param remark
     */
    freezeOrDeArchiveResource(resourceInfo: ResourceInfo, remark: string): Promise<boolean>;
    /**
     * 查找资源标签
     * @param condition
     * @param args
     */
    findResourceTags(condition: object, ...args: any[]): Promise<ResourceTagInfo[]>;
    /**
     * 分页查找资源标签
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    findIntervalResourceTagList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ResourceTagInfo>>;
    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;
    /**
     * 创建资源标签
     * @param model
     */
    createResourceTag(model: ResourceTagInfo): Promise<ResourceTagInfo>;
    /**
     * 更新资源标签
     * @param tagList
     * @param model
     */
    batchUpdateResourceTag(tagList: ResourceTagInfo[], model: Partial<ResourceTagInfo>): Promise<boolean>;
    /**
     * 过滤掉不可用的标签
     * @param resourceType
     * @param resourceTags
     */
    filterResourceTag(resourceType: string, resourceTags: string[]): Promise<string[]>;
    /**
     * 策略校验
     * @param policies
     */
    _validateAndCreateSubjectPolicies(policies: operationPolicyInfo[]): Promise<PolicyInfo[]>;
    /**
     * 构建依赖树
     * @param dependencies
     * @param {number} maxDeep
     * @param {number} currDeep
     * @param {any[]} omitFields
     * @returns {Promise<any>}
     * @private
     */
    _buildDependencyTree(dependencies: BaseResourceInfo[], maxDeep?: number, currDeep?: number, omitFields?: string[]): Promise<ResourceDependencyTree[]>;
    /**
     * 从依赖树中获取所有相关的版本信息
     * @param dependencyTree
     */
    /**
     * 从依赖树中获取指定的所有发行版本(查找多重上抛)
     * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
     * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
     * @param dependencies
     * @param resourceId
     * @param _list
     */
    findResourceVersionFromDependencyTree(dependencies: ResourceDependencyTree[], resourceId: string, _list?: ResourceDependencyTree[]): ResourceDependencyTree[];
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
     * 给资源填充最新版本详情信息
     * @param resources
     */
    fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
    /**
     * 给资源填充策略详情信息
     * @param resources
     * @param isTranslate
     */
    fillResourcePolicyInfo(resources: ResourceInfo[], isTranslate?: boolean): Promise<ResourceInfo[]>;
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param resourceVersions
     * @param policies
     */
    static _getResourceStatus(resourceVersions: object[], policies: PolicyInfo[]): number;
}
