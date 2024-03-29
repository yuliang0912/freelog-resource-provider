import { CreateResourceVersionOptions, IResourceVersionService, ResourceInfo, ResourceVersionInfo, UpdateResourceVersionOptions, IOutsideApiService } from '../../interface';
import { FreelogContext, IMongodbOperation } from 'egg-freelog-base';
import { ResourcePropertyGenerator } from '../../extend/resource-property-generator';
export declare class ResourceVersionService implements IResourceVersionService {
    ctx: FreelogContext;
    resourceService: any;
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    resourcePropertyGenerator: ResourcePropertyGenerator;
    resourceVersionDraftProvider: any;
    outsideApiService: IOutsideApiService;
    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersionInfo>;
    /**
     * 更新资源版本
     * @param versionInfo
     * @param options
     */
    updateResourceVersion(versionInfo: ResourceVersionInfo, options: UpdateResourceVersionOptions): Promise<ResourceVersionInfo>;
    /**
     * 保存资源草稿
     * @param resourceInfo
     * @param draftData
     */
    saveOrUpdateResourceVersionDraft(resourceInfo: ResourceInfo, draftData: object): Promise<any>;
    /**
     * 获取资源版本草稿
     * @param {string} resourceId
     * @returns {Promise<any>}
     */
    getResourceVersionDraft(resourceId: string): Promise<any>;
    /**
     * 获取资源文件流
     * @param versionInfo
     */
    getResourceFileStream(versionInfo: ResourceVersionInfo): Promise<{
        fileSha1: string;
        fileName: string;
        fileSize: number;
        contentType: string;
        fileStream: any;
    }>;
    /**
     * 检查文件是否可以被创建成资源的版本
     * @param fileSha1
     */
    checkFileIsCanBeCreate(fileSha1: string): Promise<boolean>;
    find(condition: object, ...args: any[]): Promise<ResourceVersionInfo[]>;
    findOne(condition: object, ...args: any[]): Promise<ResourceVersionInfo>;
    findOneByVersion(resourceId: string, version: string, ...args: any[]): Promise<ResourceVersionInfo>;
    /**
     * 批量签约并且应用到版本中
     * @param resourceInfo
     * @param subjects
     */
    batchSetPolicyToVersions(resourceInfo: ResourceInfo, subjects: any[]): Promise<boolean>;
    /**
     * 循坏依赖检查
     * @param resourceId
     * @param dependencies
     * @param deep
     */
    cycleDependCheck(resourceId: string, dependencies: any[], deep: number): Promise<{
        ret: boolean;
        deep?: number;
    }>;
    /**
     * 综合计算获得版本的最终属性
     * @param resourceVersionInfo
     * @returns {Promise<void>}
     */
    calculateResourceVersionProperty(resourceVersionInfo: ResourceVersionInfo): object;
    /**
     * * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param resourceId
     * @param dependencies
     * @param resolveResourceIds
     */
    _validateDependencies(resourceId: any, dependencies: any, resolveResourceIds: any): Promise<object[]>;
    /**
     * 验证上抛和需要解决的资源
     * @param dependencies
     * @param resolveResources
     * @param baseUpcastResources
     * @param isCheckBaseUpcast
     */
    _validateUpcastAndResolveResource(dependencies: any, resolveResources: any, baseUpcastResources: any, isCheckBaseUpcast?: boolean): Promise<{
        resolveResources: any;
        upcastResources: object[];
    }>;
    /**
     * 通过依赖和基础上抛,推断出当前版本实际需要解决的资源,实际上抛的资源.
     * allUntreatedResources: 当前版本的依赖资源以及依赖的上抛资源集合
     * backlogResources: 所有需要待处理的资源(必须要当前版本解决的)
     * upcastResources: 当前版本真实的上抛资源(基础上抛的子集)
     * @param dependencies
     * @param baseUpcastResources
     * @returns {Promise<{upcastResources: object[]; backlogResources: object[]; allUntreatedResources: object[]}>}
     * @private
     */
    _getRealUpcastAndResolveResources(dependencies: any, baseUpcastResources: any): Promise<{
        upcastResources: object[];
        backlogResources: object[];
        allUntreatedResources: object[];
    }>;
    /**
     * 校验自定义属性描述器
     * @param systemProperty
     * @param customPropertyDescriptors
     * @private
     */
    _checkCustomPropertyDescriptors(systemProperty: object, customPropertyDescriptors: any[]): void;
}
