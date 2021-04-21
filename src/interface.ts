import {SubjectAuthResult} from "./auth-interface";
import {ContractLicenseeIdentityTypeEnum, SubjectTypeEnum, ContractStatusEnum, PageResult} from "egg-freelog-base";

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

    // 甲方相关信息
    licensorId: string | number;
    licensorName: string;
    licensorOwnerId: number;
    licensorOwnerName: string;

    // 乙方相关信息
    licenseeId: string | number;
    licenseeName: string;
    licenseeOwnerId: number;
    licenseeOwnerName: string;
    licenseeIdentityType: ContractLicenseeIdentityTypeEnum;

    // 标的物相关信息
    subjectId: string;
    subjectName: string;
    subjectType: SubjectTypeEnum;

    // 合同状态机部分
    fsmCurrentState?: string | null;
    fsmRunningStatus?: number;
    fsmDeclarations?: object;

    // 其他信息
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
    intro?: string;
    coverImages?: string[];
    policies?: PolicyInfo[];
    uniqueKey?: string;
    status: number;
    latestVersion?: string;
    tags?: string[];
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
    resourceId: string,
    resourceName: string,
    version: string,
    versions: string[],
    resourceType: string,
    versionRange: string,
    versionId: string,
    fileSha1: string,
    baseUpcastResources: BaseResourceInfo[],
    resolveResources: ResolveResource[],
    dependencies: ResourceDependencyTree[]
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

    getResourcePolicies(policyIds: string[], projection: string[]): Promise<BasePolicyInfo[]>;

    batchSignResourceContracts(licenseeResourceId, subjects: SubjectInfo[]): Promise<ContractInfo[]>;

    getContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;

    getResourceContracts(subjectId: string, licenseeId: string | number, options?: object): Promise<ContractInfo[]>;
}

export interface IResourceService {
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;

    updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo>;

    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<ResourceDependencyTree[]>;

    getResourceAuthTree(versionInfo: ResourceVersionInfo): Promise<ResourceAuthTree[][]>;

    findByResourceId(resourceId: string, ...args): Promise<ResourceInfo>;

    findOneByResourceName(resourceName: string, ...args): Promise<ResourceInfo>;

    findByResourceNames(resourceNames: string[], ...args): Promise<ResourceInfo[]>;

    getRelationAuthTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<ResourceAuthTree[][]>;

    getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]>;

    findOne(condition: object, ...args): Promise<ResourceInfo>;

    find(condition: object, ...args): Promise<ResourceInfo[]>;

    findIntervalList(condition: object, skip?: number, limit?: number, projection?: string[], sort?: object): Promise<PageResult<ResourceInfo>>;

    count(condition: object): Promise<number>;

    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;

    fillResourcePolicyInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;

    fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;

    findUserCreatedResourceCounts(userIds: number[]);
}

export interface IResourceVersionService {

    createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersionInfo>;

    updateResourceVersion(versionInfo: ResourceVersionInfo, options: UpdateResourceVersionOptions): Promise<ResourceVersionInfo>;

    find(condition: object, ...args): Promise<ResourceVersionInfo[]>;

    findOne(condition: object, ...args): Promise<ResourceVersionInfo>;

    findOneByVersion(resourceId: string, version: string, ...args): Promise<ResourceVersionInfo>;

    saveOrUpdateResourceVersionDraft(resourceInfo: ResourceInfo, draftData: object);

    getResourceVersionDraft(resourceId: string);

    checkFileIsCanBeCreate(fileSha1: string): Promise<boolean>;

    batchSetPolicyToVersions(resourceInfo: ResourceInfo, subjects: any[]);

    getResourceFileStream(versionInfo: ResourceVersionInfo): Promise<{ fileSha1: string, fileName: string, fileSize: number, contentType: string, fileStream: any }>;

    // validateDependencies(resourceId, dependencies): Promise<object[]>;

    cycleDependCheck(resourceId: string, dependencies: any[], deep: number): Promise<{ ret: boolean, deep?: number }>;
}

export interface ICollectionService {

    collectionResource(model: CollectionResourceInfo): Promise<CollectionResourceInfo>;

    isCollected(resourceIds: string[]): Promise<Array<{ resourceId: string, isCollected: boolean }>>;

    find(condition: object, ...args): Promise<CollectionResourceInfo[]>;

    findOne(condition: object, ...args): Promise<CollectionResourceInfo>;

    deleteOne(condition: object): Promise<boolean>;

    count(condition: object): Promise<number>;

    findIntervalList(resourceType: string, omitResourceType: string, keywords: string, resourceStatus: number, skip: number, limit: number): Promise<PageResult<CollectionResourceInfo>>;
}

export interface IResourceAuthService {

    contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult;

    resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult>;

    resourceUpstreamAuth(resourceAuthTree: ResourceAuthTree[][]): Promise<SubjectAuthResult>;

    resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'testAuth' | 'auth'): Promise<any[]>;

    resourceRelationTreeAuth(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<any[]>;
}
