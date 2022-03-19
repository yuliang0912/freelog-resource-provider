import { SubjectAuthResult } from './auth-interface';
import { ContractLicenseeIdentityTypeEnum, SubjectTypeEnum, ContractStatusEnum, PageResult } from 'egg-freelog-base';
import { EachMessagePayload } from 'kafkajs';
export interface operationPolicyInfo {
    policyId?: string;
    policyText?: string;
    policyName?: string;
    status?: number;
}
export interface CreateResourceOptions {
    userId: number;
    username: string;
    resourceType: string;
    name: string;
    intro?: string;
    policies?: operationPolicyInfo[];
    coverImages?: string[];
    tags?: string[];
}
export interface UpdateResourceOptions {
    resourceId: string;
    intro?: string;
    coverImages?: [string];
    tags?: string[];
    addPolicies?: operationPolicyInfo[];
    updatePolicies?: operationPolicyInfo[];
}
export interface CreateResourceVersionOptions {
    version: string;
    fileSha1: string;
    filename: string;
    description: string;
    systemProperty?: object;
    dependencies?: BaseResourceInfo[];
    baseUpcastResources?: BaseResourceInfo[];
    resolveResources?: ResolveResource[];
    customPropertyDescriptors?: object[];
}
export interface UpdateResourceVersionOptions {
    resolveResources?: ResolveResource[];
    description?: string;
    customPropertyDescriptors?: object[];
}
export interface GetResourceDependencyOrAuthTreeOptions {
    maxDeep?: number;
    omitFields?: string[];
    isContainRootNode?: boolean;
}
export interface BaseContractInfo {
    policyId: string;
    contractId?: string;
}
export interface ResolveResource {
    resourceId: string;
    resourceName?: string;
    contracts: BaseContractInfo[];
}
export interface SubjectInfo {
    subjectId: string;
    policyId: string;
    operation?: number;
}
export interface ContractInfo {
    contractId: string;
    contractName: string;
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;
    licenseeIdentityType: ContractLicenseeIdentityTypeEnum;
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;
    fsmCurrentState?: string | null;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;
    policyId: string;
    status?: ContractStatusEnum;
    authStatus: number;
    createDate?: Date;
    isAuth?: boolean;
    isTestAuth?: boolean;
}
export interface BasePolicyInfo {
    policyId: string;
    policyText: string;
    subjectType?: number;
    fsmDescriptionInfo: object;
    translateInfo?: object;
}
export interface PolicyInfo extends BasePolicyInfo {
    status: number;
    policyName: string;
}
export interface ResourceInfo {
    resourceId?: string;
    resourceName: string;
    resourceType: string;
    userId: number;
    username: string;
    resourceVersions: BaseResourceVersion[];
    baseUpcastResources: BaseResourceInfo[];
    resourceNameAbbreviation?: string;
    intro?: string;
    coverImages?: string[];
    policies?: PolicyInfo[];
    uniqueKey?: string;
    status: number;
    latestVersion?: string;
    tags?: string[];
}
export interface ResourceTagInfo {
    tagId?: string;
    tagName: string;
    tagType: 1 | 2;
    authority: 1 | 2 | 3;
    resourceRange: string[];
    resourceRangeType: 1 | 2 | 3;
    createUserId: number;
}
export interface BaseResourceInfo {
    resourceId: string;
    resourceName?: string;
    versionRange?: string;
}
export interface BaseResourceVersion {
    versionId: string;
    version: string;
}
export interface ResourceVersionInfo extends BaseResourceVersion {
    resourceId: string;
    resourceName: string;
    userId: number;
    resourceType: string;
    fileSha1: string;
    filename: string;
    description?: string;
    dependencies: BaseResourceInfo[];
    upcastResources?: BaseResourceInfo[];
    resolveResources?: ResolveResource[];
    systemProperty?: {
        [key: string]: string & number;
    };
    customPropertyDescriptors?: object[];
    status?: number;
}
export interface CollectionResourceInfo {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    userId: number;
    authorId: number;
    authorName: string;
}
export interface ResourceDependencyTree {
    resourceId: string;
    resourceName: string;
    version: string;
    versions: string[];
    resourceType: string;
    versionRange: string;
    versionId: string;
    fileSha1: string;
    baseUpcastResources: BaseResourceInfo[];
    resolveResources: ResolveResource[];
    dependencies: ResourceDependencyTree[];
}
export interface ResourceAuthTree {
    resourceId: string;
    resourceName: string;
    contracts: BaseContractInfo[];
    versionId: string;
    version: string;
    versionRange: string;
    fileSha1?: string;
    children: ResourceAuthTree[][];
}
export interface IOutsideApiService {
    getFileStream(fileSha1: string): Promise<any>;
    getFileObjectProperty(fileSha1: string, resourceType: string): Promise<object>;
    createPolicies(policyTexts: string[]): Promise<BasePolicyInfo[]>;
    getResourcePolicies(policyIds: string[], projection: string[], isTranslate?: boolean): Promise<BasePolicyInfo[]>;
    batchSignResourceContracts(licenseeResourceId: any, subjects: SubjectInfo[]): Promise<ContractInfo[]>;
    getContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;
    getResourceContracts(subjectId: string, licenseeId: string | number, options?: object): Promise<ContractInfo[]>;
}
export interface IResourceService {
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;
    updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo>;
    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<ResourceDependencyTree[]>;
    getResourceAuthTreeFromDependencyTree(dependencyTree: ResourceDependencyTree[]): ResourceAuthTree[][];
    getResourceAuthTree(versionInfo: ResourceVersionInfo): Promise<ResourceAuthTree[][]>;
    findByResourceId(resourceId: string, ...args: any[]): Promise<ResourceInfo>;
    findOneByResourceName(resourceName: string, ...args: any[]): Promise<ResourceInfo>;
    findByResourceNames(resourceNames: string[], ...args: any[]): Promise<ResourceInfo[]>;
    getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]>;
    findOne(condition: object, ...args: any[]): Promise<ResourceInfo>;
    find(condition: object, ...args: any[]): Promise<ResourceInfo[]>;
    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ResourceInfo>>;
    count(condition: object): Promise<number>;
    /**
     * 冻结或解封资源
     * @param resourceInfo
     * @param remark
     */
    freezeOrDeArchiveResource(resourceInfo: ResourceInfo, remark: string): Promise<boolean>;
    /**
     * 创建资源版本
     * @param resourceInfo
     * @param versionInfo
     */
    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;
    /**
     * 填充资源策略信息
     * @param resources
     * @param isTranslate
     */
    fillResourcePolicyInfo(resources: ResourceInfo[], isTranslate?: boolean): Promise<ResourceInfo[]>;
    /**
     * 填充资源的最新版本信息
     * @param resources
     */
    fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
    /**
     * 查找用户创建的资源数量
     * @param userIds
     */
    findUserCreatedResourceCounts(userIds: number[]): any;
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
     * 创建资源tag
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
     * 查找资源标签
     * @param condition
     * @param args
     */
    findResourceTags(condition: object, ...args: any[]): Promise<ResourceTagInfo[]>;
    /**
     * 过滤掉不可用的资源标签
     * @param resourceType
     * @param resourceTags
     */
    filterResourceTag(resourceType: string, resourceTags: string[]): Promise<string[]>;
    /**
     * 分页查找资源标签
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    findIntervalResourceTagList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ResourceTagInfo>>;
}
export interface IResourceVersionService {
    createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersionInfo>;
    updateResourceVersion(versionInfo: ResourceVersionInfo, options: UpdateResourceVersionOptions): Promise<ResourceVersionInfo>;
    find(condition: object, ...args: any[]): Promise<ResourceVersionInfo[]>;
    findOne(condition: object, ...args: any[]): Promise<ResourceVersionInfo>;
    findOneByVersion(resourceId: string, version: string, ...args: any[]): Promise<ResourceVersionInfo>;
    saveOrUpdateResourceVersionDraft(resourceInfo: ResourceInfo, draftData: object): any;
    getResourceVersionDraft(resourceId: string): any;
    checkFileIsCanBeCreate(fileSha1: string): Promise<boolean>;
    batchSetPolicyToVersions(resourceInfo: ResourceInfo, subjects: any[]): any;
    getResourceFileStream(versionInfo: ResourceVersionInfo): Promise<{
        fileSha1: string;
        fileName: string;
        fileSize: number;
        contentType: string;
        fileStream: any;
    }>;
    cycleDependCheck(resourceId: string, dependencies: any[], deep: number): Promise<{
        ret: boolean;
        deep?: number;
    }>;
    calculateResourceVersionProperty(resourceVersionInfo: ResourceVersionInfo): object;
}
export interface ICollectionService {
    collectionResource(model: CollectionResourceInfo): Promise<CollectionResourceInfo>;
    isCollected(resourceIds: string[]): Promise<Array<{
        resourceId: string;
        isCollected: boolean;
    }>>;
    find(condition: object, ...args: any[]): Promise<CollectionResourceInfo[]>;
    findOne(condition: object, ...args: any[]): Promise<CollectionResourceInfo>;
    deleteOne(condition: object): Promise<boolean>;
    count(condition: object): Promise<number>;
    countByResourceIds(condition: object): Promise<Array<{
        resourceId: number;
        count: number;
    }>>;
    findIntervalList(resourceType: string, omitResourceType: string, keywords: string, resourceStatus: number, skip: number, limit: number): Promise<PageResult<CollectionResourceInfo>>;
}
export interface IResourceAuthService {
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult;
    resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult>;
    resourceUpstreamAuth(resourceAuthTree: ResourceAuthTree[][]): Promise<SubjectAuthResult>;
    resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'testAuth' | 'auth'): Promise<any[]>;
    resourceRelationTreeAuth(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<any[]>;
}
export interface IKafkaSubscribeMessageHandle {
    subscribeTopicName: string;
    consumerGroupId: string;
    messageHandle(payload: EachMessagePayload): Promise<void>;
}
export interface IContractAuthStatusChangedEventMessage {
    contractId: string;
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;
    licenseeId: string | number;
    licenseeOwnerId: number;
    licensorId: string | number;
    licensorOwnerId: number;
    beforeAuthStatus: ContractAuthStatusEnum;
    afterAuthStatus: ContractAuthStatusEnum;
    contractStatus: ContractStatusEnum;
}
export declare enum ContractAuthStatusEnum {
    /**
     * 只获得正式授权
     * @type {number}
     */
    Authorized = 1,
    /**
     * 只获得测试授权
     * @type {number}
     */
    TestNodeAuthorized = 2,
    /**
     * 未获得任何授权
     */
    Unauthorized = 128
}
