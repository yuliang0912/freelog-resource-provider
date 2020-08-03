import {provide, inject} from 'midway';
import * as semver from 'semver';
import {
    BaseResourceInfo, CreateResourceVersionOptions,
    IResourceVersionService, ResourceInfo, ResourceVersionInfo, UpdateResourceVersionOptions
} from '../../interface';
import {ArgumentError, ApplicationError} from 'egg-freelog-base';
import {isEmpty, isUndefined, uniqBy, chain, differenceBy, pick} from 'lodash';

@provide('resourceVersionService')
export class ResourceVersionService implements IResourceVersionService {

    @inject()
    ctx;
    @inject()
    resourceService;
    @inject()
    resourceVersionProvider;
    @inject()
    resourcePropertyGenerator;
    @inject()
    resourceVersionDraftProvider;

    async find(condition: object, ...args): Promise<ResourceVersionInfo[]> {
        return this.resourceVersionProvider.find(condition, ...args);
    }

    async findOne(condition: object, ...args): Promise<ResourceVersionInfo> {
        return this.resourceVersionProvider.findOne(condition, ...args);
    }

    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    async createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersionInfo> {

        await this._validateDependencies(resourceInfo.resourceId, options.dependencies);
        const isFirstVersion = isEmpty(resourceInfo.resourceVersions);
        const {resolveResources, upcastResources} = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);

        const model: ResourceVersionInfo = {
            versionId: options.versionId,
            version: options.version,
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            fileSha1: options.fileSha1,
            dependencies: options.dependencies,
            description: options.description,
            resolveResources,
            upcastResources: upcastResources as BaseResourceInfo[],
            systemProperty: options.systemProperty,
            customPropertyDescriptors: options.customPropertyDescriptors,
            status: 1
        };

        const resourceVersion = await this.resourceVersionProvider.create(model);
        this.resourceVersionDraftProvider.deleteOne({resourceId: resourceInfo.resourceId}).then();
        if (resourceVersion.status === 1) {
            const versionInfo = {
                version: options.version, versionId: options.versionId, createDate: resourceVersion.createDate
            };
            await this.resourceService.createdResourceVersionHandle(resourceInfo, versionInfo);
        }

        return resourceVersion;
    }

    /**
     * 更新资源版本
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<void>}
     */
    async updateResourceVersion(versionInfo: ResourceVersionInfo, options: UpdateResourceVersionOptions): Promise<ResourceVersionInfo> {
        const model: any = {};
        if (!isUndefined(options.description)) {
            model.description = options.description;
        }
        if (!isUndefined(options.customPropertyDescriptors)) {
            model.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        if (isEmpty(options.resolveResources) || isUndefined(options.resolveResources)) {
            return this.resourceVersionProvider.findOneAndUpdate({versionId: versionInfo.versionId}, model, {new: true});
        }

        const invalidResolveResources = differenceBy(options.resolveResources, versionInfo.resolveResources, x => x['resourceId']);
        if (invalidResolveResources.length) {
            throw new ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), {invalidResolveResources});
        }
        const updatedResolveResources = versionInfo['toObject']().resolveResources;
        for (let i = 0, j = options.resolveResources.length; i < j; i++) {
            const {resourceId, contracts} = options.resolveResources[i] as any;
            const intrinsicResolve = updatedResolveResources.find(x => x.resourceId === resourceId);
            intrinsicResolve.contracts = contracts;
        }
        const contractMap = await this.resourceBatchSignContract(versionInfo, updatedResolveResources)
            .then(contracts => new Map(contracts.map(x => [`${x.partyOne}_${x.policyId}`, x])));

        updatedResolveResources.forEach(resolveResource => resolveResource.contracts.forEach(item => {
            const key = `${resolveResource.resourceId}_${item.policyId}`;
            const signedContractInfo = contractMap.get(key);
            if (signedContractInfo) {
                item.contractId = signedContractInfo['contractId'];
            }
        }));
        model.resolveResources = updatedResolveResources;
        return this.resourceVersionProvider.findOneAndUpdate({versionId: versionInfo.versionId}, model, {new: true});
    }

    /**
     * 资源批量签约
     * @param {ResourceVersionInfo} versionInfo
     * @param {any[]} changedResolveResources
     * @returns {Promise<any>}
     */
    async resourceBatchSignContract(versionInfo: ResourceVersionInfo, changedResolveResources = []) {
        const {resourceId, resolveResources} = versionInfo;
        const beSignResources = changedResolveResources.length ? changedResolveResources : resolveResources;
        if (!beSignResources.length) {
            return;
        }
        const contracts = await this.ctx.curlIntranetApi(`${this.ctx.webApi.contractInfo}/batchCreateReleaseContracts`, {
            method: 'post', contentType: 'json', data: {
                targetId: resourceId,
                partyTwoId: resourceId,
                contractType: 1,
                signResources: beSignResources.map(item => Object({
                    resourceId: item.resourceId,
                    policyIds: item.contracts.map(x => x.policyId)
                }))
            }
        });
        return contracts;
    }

    /**
     * 保存资源草稿
     * @param {ResourceInfo} resourceInfo
     * @param {CreateResourceVersionOptions} options
     * @returns {Promise<any>}
     */
    async saveOrUpdateResourceVersionDraft(resourceInfo: ResourceInfo, draftData: object) {

        const model = {
            resourceId: resourceInfo.resourceId,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            draftData: draftData ?? {}
        };

        return this.resourceVersionDraftProvider.findOneAndUpdate({resourceId: resourceInfo.resourceId}, model, {new: true}).then(data => {
            return data || this.resourceVersionDraftProvider.create(model);
        });
    }

    /**
     * 获取资源版本草稿
     * @param {string} resourceId
     * @returns {Promise<any>}
     */
    async getResourceVersionDraft(resourceId: string) {
        return this.resourceVersionDraftProvider.findOne({resourceId});
    }

    /**
     * 检查文件是否可以被创建成资源的版本
     * @param fileSha1
     */
    async checkFileIsCanBeCreate(fileSha1: string): Promise<boolean> {
        return this.resourceVersionProvider.findOne({
            fileSha1, userId: {$ne: this.ctx.userId}
        }, '_id').then(x => !Boolean(x));
    }

    /**
     * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param ctx
     * @param dependencies
     * @returns {Promise<any>}
     * @private
     */
    async _validateDependencies(resourceId, dependencies): Promise<object[]> {

        if (isEmpty(dependencies)) {
            return dependencies;
        }

        if (dependencies.length !== uniqBy(dependencies, 'resourceId').length) {
            throw new ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), {dependencies});
        }

        const cycleDependCheckResult = await this._cycleDependCheck(resourceId, dependencies || []);
        if (cycleDependCheckResult.ret) {
            throw new ApplicationError(this.ctx.gettext('release-circular-dependency-error'), {
                resourceId, deep: cycleDependCheckResult.deep
            });
        }

        const dependResourceMap = await this.resourceService.find({_id: {$in: dependencies.map(x => x.resourceId)}})
            .then(list => new Map(list.map(x => [x.resourceId, x])));

        const invalidDependencies = [];
        const invalidResourceVersionRanges = [];
        dependencies.forEach(dependency => {
            const resourceInfo = dependResourceMap.get(dependency.resourceId);
            if (!resourceInfo || resourceInfo.status !== 1) {
                invalidDependencies.push(dependency);
                return;
            }
            if (!resourceInfo.resourceVersions.some(x => semver.satisfies(x['version'], dependency.versionRange))) {
                invalidResourceVersionRanges.push(dependency);
            }
            dependency.resourceName = resourceInfo.resourceName;
        });

        if (invalidDependencies.length) {
            throw new ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), {invalidDependencies});
        }
        if (invalidResourceVersionRanges.length) {
            throw new ArgumentError(this.ctx.gettext('resource-depend-release-versionRange-invalid'), {invalidResourceVersionRanges});
        }

        return dependencies;
    }

    /**
     * 循坏依赖检查
     * @param resourceId
     * @param dependencies
     * @param {number} deep
     * @returns {Promise<{ret: boolean; deep?: number}>}
     * @private
     */
    async _cycleDependCheck(resourceId, dependencies, deep = 1): Promise<{ ret: boolean, deep?: number }> {

        if (deep > 20) {
            throw new ApplicationError('资源嵌套层级超过系统限制');
        }
        if (isEmpty(dependencies)) {
            return {ret: false};
        }
        if (dependencies.some(x => x.resourceId === resourceId)) {
            return {ret: true, deep};
        }

        const dependVersionIdSet = new Set();
        const dependResourceInfos = await this.resourceService.find({_id: {$in: dependencies.map(x => x.resourceId)}}, 'resourceVersions');
        dependResourceInfos.forEach(resourceInfo => resourceInfo.resourceVersions.forEach(({version}) => {
            dependVersionIdSet.add(this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version));
        }));
        if (!dependVersionIdSet.size) {
            return {ret: false};
        }

        const dependVersionInfos = await this.resourceVersionProvider.find({versionId: {$in: [...dependVersionIdSet.values()]}}, 'dependencies');
        const dependSubResources = chain(dependVersionInfos).map(m => m.dependencies).flattenDeep().value();

        return this._cycleDependCheck(resourceId, dependSubResources, deep + 1);
    }

    /**
     * 验证上抛和需要解决的资源
     * @param dependencies
     * @param resolveResources
     * @param baseUpcastReleases
     * @param {boolean} isCheckBaseUpcast
     * @returns {Promise<{resolveResources: any; upcastResources: object[]}>}
     * @private
     */
    async _validateUpcastAndResolveResource(dependencies, resolveResources, baseUpcastResources, isCheckBaseUpcast = false) {

        // 检查发行有效性,策略有效性,上抛发行是否合理,声明处理的发行是否合理以及未处理的依赖项
        const {upcastResources, backlogResources, allUntreatedResources} = await this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources);

        // 第一个发行方案需要检查基础上抛是否在范围内
        if (isCheckBaseUpcast) {
            const invalidBaseUpcastResources = differenceBy(baseUpcastResources, upcastResources, x => x['resourceId']);
            if (invalidBaseUpcastResources.length) {
                throw new ApplicationError(this.ctx.gettext('release-scheme-upcast-validate-failed'), {invalidBaseUpcastResources});
            }
        }

        // 未解决的发行(待办发行没有全部解决)
        const untreatedResources = differenceBy(backlogResources, resolveResources, x => x['resourceId']);
        if (untreatedResources.length) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), {untreatedResources});
        }

        // 无效的解决(不在待办发行中)
        const invalidResolveResources = differenceBy(resolveResources, backlogResources, x => x['resourceId']);
        if (invalidResolveResources.length) {
            throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'resolveResources'), {invalidResolveResources});
        }

        const resourceMap = new Map(allUntreatedResources.map(x => [x['resourceId'], x['resourceName']]));

        resolveResources.forEach(item => item.resourceName = resourceMap.get(item.resourceId));

        return {resolveResources, upcastResources};
    }

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
    async _getRealUpcastAndResolveResources(dependencies, baseUpcastResources): Promise<{ upcastResources: object[], backlogResources: object[], allUntreatedResources: object[] }> {

        let upcastResources = [];
        let backlogResources = [];
        let allUntreatedResources = [];
        if (!dependencies.length) {
            return {upcastResources, backlogResources, allUntreatedResources};
        }

        const dependResources = await this.resourceService.find({_id: {$in: dependencies.map(x => x.resourceId)}});
        const invalidResources = dependResources.filter(x => x.status !== 1);
        if (invalidResources.length) {
            throw new ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), {invalidResources});
        }

        allUntreatedResources = chain(dependResources).map(x => x.baseUpcastResources)
            .flattenDeep().concat(dependencies).uniqBy(x => x.resoruceId).map(x => pick(x, ['resourceId', 'resourceName'])).value();

        // 真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
        backlogResources = differenceBy(allUntreatedResources, baseUpcastResources, x => x['resourceId']);
        upcastResources = differenceBy(allUntreatedResources, backlogResources, x => x['resourceId']);

        return {allUntreatedResources, backlogResources, upcastResources};
    }
}
