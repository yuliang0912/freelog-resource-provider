import { CreateResourceOptions, GetResourceDependencyOrAuthTreeOptions, IOutsideApiService, IResourceService, PolicyInfo, ResourceInfo, ResourceVersionInfo, UpdateResourceOptions, IResourceVersionService, PageResult, ResourceAuthTree, ResourceDependencyTree, BaseResourceInfo, operationPolicyInfo } from '../../interface';
export declare class ResourceService implements IResourceService {
    ctx: any;
    resourceProvider: any;
    resourcePropertyGenerator: any;
    resourcePolicyCompiler: any;
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
     * 获取关系树(资源=>资源的依赖=>依赖的上抛,最多三层)
     * @param versionInfo
     */
    getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]>;
    /**
     * 获取资源关系树
     * @param versionInfo
     */
    getRelationAuthTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<ResourceAuthTree[][]>;
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
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ResourceInfo>>;
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
     * 策略校验
     * @param policyIds
     * @private
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
     * @param _list
     * @private
     */
    _findResourceVersionFromDependencyTree(dependencies: ResourceDependencyTree[], resourceId: string, _list?: ResourceDependencyTree[]): ResourceDependencyTree[];
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
     */
    fillResourcePolicyInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @returns {number} 资源状态
     * @private
     */
    static _getResourceStatus(resourceVersions: object[], policies: PolicyInfo[]): number;
}
