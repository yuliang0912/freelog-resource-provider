import {ValidatorResult} from 'jsonschema';

export interface CreateResourceOptions {
    userId: number;
    username: string;
    resourceType: string;
    name: string;
    intro?: string;
    policies?: object[];
    coverImages?: string[];
}

export interface UpdateResourceOptions {
    resourceId: string;
    intro?: string;
    coverImages?: [string];
    policyChangeInfo?: object; //策略变动信息,包括add.remove,update等
}

export interface CreateResourceVersionOptions {
    version: string;
    fileSha1: string;
    description: string;
    dependencies?: [object];
    upcastResources?: [object];
    resolveResources?: [object];
    customPropertyDescriptors?: [object];
}

export interface GetResourceDependencyOrAuthTreeOptions {
    resourceId: string;
    maxDeep?: number;
    version?: string;
    omitFields?: [string];
    isContainRootNode?: boolean;
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
    policies?: object[];
    uniqueKey?: string;
    status: number;
}

export interface ResourceVersion {
    resourceId: string;
    resourceName: string;
    userId: number;
    versionId: string;
    version: string;
    resourceType: string;
    fileSha1: string;
    description?: string;
    upcastResources?: [object];
    resolveResources?: [object];
    systemProperties?: [object];
    customPropertyDescriptors?: [object];
    status: number;
}

/**
 * 针对object做校验的基础接口
 */
export interface IJsonSchemaValidate {
    validate(instance: object[] | object): ValidatorResult;
}

export interface IResourceService {
    createResource(options: CreateResourceOptions): Promise<ResourceInfo>;

    createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersion>;

    updateResource(options: UpdateResourceOptions): Promise<ResourceInfo>;

    getResourceDependencyTree(options: GetResourceDependencyOrAuthTreeOptions): Promise<object[]>;

    findOneByResourceName(resourceName: string, ...args): Promise<ResourceInfo>;

    findByResourceNames(resourceNames: string[], ...args): Promise<ResourceInfo[]>;

    findOne(condition: object, ...args): Promise<ResourceInfo>;

    find(condition: object, ...args): Promise<ResourceInfo[]>;

    findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<ResourceInfo[]>;

    count(condition: object): Promise<number>;
}