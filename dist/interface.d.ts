import { ValidatorResult } from 'jsonschema';
import { IdentityType, SubjectTypeEnum, ContractStatusEnum } from './enum';
import { SubjectAuthResult } from "./auth-interface";
export interface PageResult<T> {
    page: number;
    pageSize: number;
    totalItem: number;
    dataList: T[];
}
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
    licenseeIdentityType: IdentityType;
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
/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object, ...args: any[]): ValidatorResult;
}
export interface IOutsideApiService {
    getFileStream(fileSha1: string): Promise<any>;
    getFileObjectProperty(fileSha1: string, resourceType: string): Promise<object>;
    createPolicies(policyTexts: string[]): Promise<BasePolicyInfo[]>;
    getResourcePolicies(policyIds: string[], projection: string[]): Promise<BasePolicyInfo[]>;
    batchSignResourceContracts(licenseeResourceId: any, subjects: SubjectInfo[]): Promise<ContractInfo[]>;
    getContractByContractIds(contractIds: string[], options?: object): Promise<ContractInfo[]>;
    getResourceContracts(subjectId: string, licenseeId: string | number, options?: object): Promise<ContractInfo[]>;
}
export interface IResourceService {
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;
    updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo>;
    getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<ResourceDependencyTree[]>;
    getResourceAuthTree(versionInfo: ResourceVersionInfo): Promise<ResourceAuthTree[][]>;
    findByResourceId(resourceId: string, ...args: any[]): Promise<ResourceInfo>;
    findOneByResourceName(resourceName: string, ...args: any[]): Promise<ResourceInfo>;
    findByResourceNames(resourceNames: string[], ...args: any[]): Promise<ResourceInfo[]>;
    getRelationAuthTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<ResourceAuthTree[][]>;
    getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]>;
    findOne(condition: object, ...args: any[]): Promise<ResourceInfo>;
    find(condition: object, ...args: any[]): Promise<ResourceInfo[]>;
    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ResourceInfo>>;
    count(condition: object): Promise<number>;
    createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean>;
    fillResourcePolicyInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
    fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]>;
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
        fileStream: any;
    }>;
    validateDependencies(resourceId: any, dependencies: any): Promise<object[]>;
    cycleDependCheck(resourceId: string, dependencies: any[], deep: number): Promise<{
        ret: boolean;
        deep?: number;
    }>;
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
    findPageList(resourceType: string, keywords: string, resourceStatus: number, page: number, pageSize: number): Promise<PageResult<CollectionResourceInfo>>;
}
export interface IResourceAuthService {
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): SubjectAuthResult;
    resourceAuth(versionInfo: ResourceVersionInfo, isIncludeUpstreamAuth: boolean): Promise<SubjectAuthResult>;
    resourceBatchAuth(resourceVersions: ResourceVersionInfo[], authType: 'testAuth' | 'auth'): Promise<any[]>;
    resourceRelationTreeAuth(versionInfo: ResourceVersionInfo): Promise<any[]>;
}
