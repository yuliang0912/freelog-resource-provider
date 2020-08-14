import {ValidatorResult} from 'jsonschema';
import {IdentityType, SubjectTypeEnum, ContractStatusEnum} from './enum';

export interface PageResult {
    page: number;
    pageSize: number;
    totalItem: number;
    dataList: any[];
}

export interface CreateResourceOptions {
    userId: number;
    username: string;
    resourceType: string;
    name: string;
    intro?: string;
    policies?: PolicyInfo[];
    coverImages?: string[];
    tags?: string[];
}

export interface UpdateResourceOptions {
    resourceId: string;
    intro?: string;
    coverImages?: [string];
    tags?: string[];
    addPolicies?: PolicyInfo[];
    updatePolicies?: PolicyInfo[];
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
    licenseeIdentityType: IdentityType;

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

export interface PolicyInfo {
    policyId: string;
    policyName?: string;
    policyText?: string;
    status?: number;
    fsmDescriptionInfo?: object;
}

export interface ResourceInfo {
    resourceId?: string;
    resourceName: string;
    resourceType: string;
    userId: number;
    username: string;
    resourceVersions: object[];
    baseUpcastResources: object[];
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

export interface ResourceVersionInfo {
    resourceId: string;
    resourceName: string;
    userId: number;
    versionId: string;
    version: string;
    resourceType: string;
    fileSha1: string;
    filename: string;
    description?: string;
    dependencies: BaseResourceInfo[];
    upcastResources?: BaseResourceInfo[];
    resolveResources?: ResolveResource[];
    systemProperty?: any;
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

/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object, ...args): ValidatorResult;
}

export interface IOutsideApiService {

    getFileStream(fileSha1: string): Promise<any>;

    getFileObjectProperty(fileSha1: string, resourceType: string): Promise<object>;

    getResourcePolicies(policyIds: string[], projection: string[]): Promise<PolicyInfo[]>;

    batchSignResourceContracts(licenseeResourceId, subjects: SubjectInfo[]): Promise<ContractInfo[]>;

    getResourceContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;
}

export interface IResourceService {
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;

    updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo>;

    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<object[]>;

    getResourceAuthTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<object[]>;

    findByResourceId(resourceId: string, ...args): Promise<ResourceInfo>;

    findOneByResourceName(resourceName: string, ...args): Promise<ResourceInfo>;

    findByResourceNames(resourceNames: string[], ...args): Promise<ResourceInfo[]>;

    findOne(condition: object, ...args): Promise<ResourceInfo>;

    find(condition: object, ...args): Promise<ResourceInfo[]>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult>;

    count(condition: object): Promise<number>;

    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;

    fillResourcePolicyInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;

    fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
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

    getResourceFileStream(versionInfo: ResourceVersionInfo): Promise<{ fileSha1: string, fileName: string, fileSize: number, fileStream: any }>;
}

export interface ICollectionService {

    collectionResource(model: CollectionResourceInfo): Promise<CollectionResourceInfo>;

    isCollected(resourceIds: string[]): Promise<Array<{ resourceId: string, isCollected: boolean }>>;

    find(condition: object, ...args): Promise<CollectionResourceInfo[]>;

    findOne(condition: object, ...args): Promise<CollectionResourceInfo>;

    deleteOne(condition: object): Promise<boolean>;

    findPageList(resourceType: string, keywords: string, resourceStatus: number, page: number, pageSize: number): Promise<PageResult>;
}

export interface IResourceAuthService {

    contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean>;

}
