import {provide, inject} from 'midway';
import * as semver from 'semver';
import {
    BaseResourceInfo, CreateResourceVersionOptions,
    IResourceVersionService, ResourceInfo, ResourceVersionInfo,
    UpdateResourceVersionOptions, IOutsideApiService, SubjectInfo
} from '../../interface';
import {ArgumentError, ApplicationError, FreelogContext, IMongodbOperation} from 'egg-freelog-base';
import {
    isEmpty, isUndefined, isArray,
    uniqBy, chain, differenceBy,
    assign, pick, isString,
    differenceWith, intersectionWith, intersection
} from 'lodash';

@provide('resourceVersionService')
export class ResourceVersionService implements IResourceVersionService {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService;
    @inject()
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    @inject()
    resourcePropertyGenerator;
    @inject()
    resourceVersionDraftProvider;
    @inject()
    outsideApiService: IOutsideApiService;

    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    async createResourceVersion(resourceInfo: ResourceInfo, options: CreateResourceVersionOptions): Promise<ResourceVersionInfo> {

        await this.validateDependencies(resourceInfo.resourceId, options.dependencies);
        const isFirstVersion = isEmpty(resourceInfo.resourceVersions);
        const {resolveResources, upcastResources} = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);

        const model: ResourceVersionInfo = {
            version: options.version,
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            fileSha1: options.fileSha1,
            filename: options.filename,
            dependencies: options.dependencies,
            description: options.description,
            resolveResources,
            upcastResources: upcastResources as BaseResourceInfo[],
            systemProperty: options.systemProperty,
            customPropertyDescriptors: options.customPropertyDescriptors,
            versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, options.version)
        };

        if (isArray(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(options.systemProperty ?? {}, options.customPropertyDescriptors);
        }

        if (!isEmpty(resolveResources)) {
            const beSignSubjects = chain(resolveResources).map(({resourceId, contracts}) => contracts.map(({policyId}) => Object({
                subjectId: resourceId, policyId
            }))).flattenDeep().value();
            await this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, beSignSubjects).then(contracts => {
                const contractMap = new Map<string, string>(contracts.map(x => [x.subjectId + x.policyId, x.contractId]));
                model.resolveResources.forEach(resolveResource => resolveResource.contracts.forEach(resolveContractInfo => {
                    resolveContractInfo.contractId = contractMap.get(resolveResource.resourceId + resolveContractInfo.policyId) ?? '';
                }));
            });
        }

        const resourceVersion = await this.resourceVersionProvider.create(model);
        this.resourceVersionDraftProvider.deleteOne({resourceId: resourceInfo.resourceId}).then();
        await this.resourceService.createdResourceVersionHandle(resourceInfo, resourceVersion);

        return resourceVersion;
    }

    /**
     * 更新资源版本
     * @param versionInfo
     * @param options
     */
    async updateResourceVersion(versionInfo: ResourceVersionInfo, options: UpdateResourceVersionOptions): Promise<ResourceVersionInfo> {
        const model: any = {};
        if (!isUndefined(options.description)) {
            model.description = options.description;
        }
        if (isArray(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(versionInfo.systemProperty, options.customPropertyDescriptors);
            model.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        // 更新合约代码较复杂,如果本次更新不牵扯到合约内容,则提前返回
        if (isUndefined(options.resolveResources) || isEmpty(options.resolveResources)) {
            return this.resourceVersionProvider.findOneAndUpdate({versionId: versionInfo.versionId}, model, {new: true});
        }

        const invalidResolveResources = differenceBy(options.resolveResources, versionInfo.resolveResources, 'resourceId');
        if (!isEmpty(invalidResolveResources)) {
            throw new ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), {invalidResolveResources});
        }

        const beSignSubjects = chain(options.resolveResources).map(({resourceId, contracts}) => contracts.map(({policyId}) => Object({
            subjectId: resourceId, policyId
        }))).flattenDeep().value();

        const contractMap = await this.outsideApiService.batchSignResourceContracts(versionInfo.resourceId, beSignSubjects).then(contracts => {
            return new Map<string, string>(contracts.map(x => [x.subjectId + x.policyId, x.contractId]));
        });

        options.resolveResources.forEach(resolveResource => resolveResource.contracts.forEach(item => {
            item.contractId = contractMap.get(resolveResource.resourceId + item.policyId) ?? '';
        }));

        model.resolveResources = versionInfo.resolveResources.map(resolveResource => {
            const modifyResolveResource = options.resolveResources.find(x => x.resourceId === resolveResource.resourceId);
            return modifyResolveResource ? assign(resolveResource, modifyResolveResource) : resolveResource;
        });
        return this.resourceVersionProvider.findOneAndUpdate({versionId: versionInfo.versionId}, model, {new: true});
    }

    /**
     * 保存资源草稿
     * @param resourceInfo
     * @param draftData
     */
    async saveOrUpdateResourceVersionDraft(resourceInfo: ResourceInfo, draftData: object) {

        const model = {
            resourceId: resourceInfo.resourceId,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            draftData: draftData ?? {}
        };

        return this.resourceVersionDraftProvider.findOneAndUpdate({resourceId: resourceInfo.resourceId}, model, {new: true}).then(data => {
            return data ?? this.resourceVersionDraftProvider.create(model);
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
     * 获取资源文件流
     * @param versionInfo
     */
    async getResourceFileStream(versionInfo: ResourceVersionInfo): Promise<{ fileSha1: string, fileName: string, fileSize: number, fileStream: any }> {

        const stream = await this.outsideApiService.getFileStream(versionInfo.fileSha1);
        if ((stream.res.headers['content-type'] ?? '').includes('application/json')) {
            throw new ApplicationError('文件读取失败', {msg: JSON.parse(stream.data.toString())?.msg});
        }
        if (!stream.res.statusCode.toString().startsWith('2')) {
            throw new ApplicationError('文件读取失败');
        }

        let extName = '';
        if (isString(versionInfo.filename)) {
            extName = versionInfo.filename.substr(versionInfo.filename.lastIndexOf('.'));
        }
        return {
            fileSha1: versionInfo.fileSha1,
            fileName: `${versionInfo.resourceName}_${versionInfo.version}${extName}`,
            fileSize: versionInfo.systemProperty.fileSize,
            fileStream: stream.data
        }
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

    async find(condition: object, ...args): Promise<ResourceVersionInfo[]> {
        return this.resourceVersionProvider.find(condition, ...args);
    }

    async findOne(condition: object, ...args): Promise<ResourceVersionInfo> {
        return this.resourceVersionProvider.findOne(condition, ...args);
    }

    async findOneByVersion(resourceId: string, version: string, ...args): Promise<ResourceVersionInfo> {
        const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
        return this.findOne({versionId}, ...args);
    }

    /**
     * 批量签约并且应用到版本中
     * @param resourceInfo
     * @param subjects
     */
    async batchSetPolicyToVersions(resourceInfo: ResourceInfo, subjects: any[]) {

        const toBeModifyVersions: string[] = [];
        const toBeSignSubjects: SubjectInfo[] = [];
        const versionModifyPolicyMap = new Map<string, SubjectInfo[]>();
        subjects.forEach(subject => subject.versions.forEach(({version, policyId, operation}) => {
            if (!versionModifyPolicyMap.has(version)) {
                toBeModifyVersions.push(version);
                versionModifyPolicyMap.set(version, []);
            }
            versionModifyPolicyMap.get(version).push({subjectId: subject.subjectId, policyId, operation});
        }));

        const invalidVersions = differenceWith(toBeModifyVersions, resourceInfo.resourceVersions, (x, y) => x === y.version);
        if (!isEmpty(invalidVersions)) {
            throw new ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), {invalidVersions});
        }

        const invalidSubjects = [];
        const versionIds = intersectionWith(resourceInfo.resourceVersions, toBeModifyVersions, (x, y) => x.version === y).map(x => x.versionId);
        const resourceVersionMap = await this.find({versionId: {$in: versionIds}}, 'version versionId resolveResources').then(list => new Map(list.map(x => [x.version, x])));
        for (let [version, subjectInfos] of versionModifyPolicyMap) {
            const resolveResources = resourceVersionMap.get(version)?.resolveResources ?? [];
            subjectInfos.forEach(({subjectId, policyId, operation}) => {
                if (operation === 1 && !toBeSignSubjects.some(x => x.subjectId == subjectId && x.policyId === policyId)) {
                    toBeSignSubjects.push({subjectId, policyId});
                }
                if (!resolveResources.some(x => x.resourceId === subjectId)) {
                    invalidSubjects.push({subjectId, policyId, version});
                }
            });
        }
        if (!isEmpty(invalidSubjects)) {
            throw new ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), {invalidSubjects});
        }
        const contractMap: Map<string, string> = await this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, toBeSignSubjects).then(list => {
            return new Map(list.map(x => [x.subjectId + x.policyId, x.contractId]));
        });

        const tasks = [], cancelFailedPolicies = [];
        for (let [version, subjectInfos] of versionModifyPolicyMap) {
            const resourceVersionInfo = resourceVersionMap.get(version);
            resourceVersionInfo.resolveResources.forEach(resolveResource => {
                const modifySubjects = subjectInfos.filter(x => x.subjectId === resolveResource.resourceId);
                if (isEmpty(modifySubjects)) {
                    return;
                }
                modifySubjects.forEach(({subjectId, policyId, operation}) => {
                    if (operation === 0) {
                        resolveResource.contracts = resolveResource.contracts.filter(x => x.policyId !== policyId);
                        return;
                    }
                    const contractId = contractMap.get(subjectId + policyId) ?? '';
                    const modifyContract = resolveResource.contracts.find(x => x.policyId === policyId);
                    if (modifyContract) {
                        modifyContract.contractId = contractId;
                    } else {
                        resolveResource.contracts.push({policyId, contractId});
                    }
                })
            })
            if (resourceVersionInfo.resolveResources.some(x => isEmpty(x.contracts))) {
                cancelFailedPolicies.push({
                    version: version,
                    subjectInfos: subjectInfos.filter(x => x.operation === 0)
                });
            } else {
                tasks.push(this.resourceVersionProvider.updateOne({
                    versionId: resourceVersionInfo.versionId
                }, {resolveResources: resourceVersionInfo.resolveResources}));
            }
        }

        return Promise.all(tasks).then(list => Boolean(list.length && list.every(x => x.ok)));
    }

    /**
     * * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param resourceId
     * @param dependencies
     */
    async validateDependencies(resourceId, dependencies): Promise<object[]> {

        if (isEmpty(dependencies)) {
            return dependencies;
        }

        if (dependencies.length !== uniqBy(dependencies, 'resourceId').length) {
            throw new ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), {dependencies});
        }

        const cycleDependCheckResult = await this.cycleDependCheck(resourceId, dependencies || [], 1);
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
     * @param deep
     */
    async cycleDependCheck(resourceId: string, dependencies: any[], deep: number): Promise<{ ret: boolean, deep?: number }> {

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

        return this.cycleDependCheck(resourceId, dependSubResources, deep + 1);
    }

    /**
     * 验证上抛和需要解决的资源
     * @param dependencies
     * @param resolveResources
     * @param baseUpcastResources
     * @param isCheckBaseUpcast
     */
    async _validateUpcastAndResolveResource(dependencies, resolveResources, baseUpcastResources, isCheckBaseUpcast = false) {

        // 检查发行有效性,策略有效性,上抛发行是否合理,声明处理的发行是否合理以及未处理的依赖项
        const {upcastResources, backlogResources, allUntreatedResources} = await this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources);

        // 第一个发行方案需要检查基础上抛是否在范围内
        if (isCheckBaseUpcast) {
            const invalidBaseUpcastResources = differenceBy(baseUpcastResources, upcastResources, 'resourceId');
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
        const invalidResolveResources = differenceBy(resolveResources, backlogResources, 'resourceId');
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
            .flattenDeep().concat(dependencies).uniqBy('resourceId').map(x => pick(x, ['resourceId', 'resourceName'])).value();

        // 真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
        backlogResources = differenceBy(allUntreatedResources, baseUpcastResources, x => x['resourceId']);
        upcastResources = differenceBy(allUntreatedResources, backlogResources, x => x['resourceId']);

        return {allUntreatedResources, backlogResources, upcastResources};
    }

    /**
     * 校验自定义属性描述器
     * @param systemProperty
     * @param customPropertyDescriptors
     * @private
     */
    _checkCustomPropertyDescriptors(systemProperty: object, customPropertyDescriptors: any[]) {
        const systemPropertyKeys = Object.keys(systemProperty ?? {});
        const customPropertyKeys = customPropertyDescriptors?.map(x => x.key);
        const repetitiveKeys = intersection(systemPropertyKeys, customPropertyKeys);
        if (!isEmpty(repetitiveKeys)) {
            throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'customPropertyDescriptors'), {repetitiveKeys})
        }
    }
}
