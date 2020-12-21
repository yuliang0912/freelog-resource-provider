"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceVersionService = void 0;
const midway_1 = require("midway");
const semver = require("semver");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
let ResourceVersionService = class ResourceVersionService {
    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    async createResourceVersion(resourceInfo, options) {
        await this.validateDependencies(resourceInfo.resourceId, options.dependencies);
        const isFirstVersion = lodash_1.isEmpty(resourceInfo.resourceVersions);
        const { resolveResources, upcastResources } = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);
        const model = {
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
            upcastResources: upcastResources,
            systemProperty: options.systemProperty,
            customPropertyDescriptors: options.customPropertyDescriptors,
            versionId: this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, options.version)
        };
        if (lodash_1.isArray(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(options.systemProperty ?? {}, options.customPropertyDescriptors);
        }
        if (!lodash_1.isEmpty(resolveResources)) {
            const beSignSubjects = lodash_1.chain(resolveResources).map(({ resourceId, contracts }) => contracts.map(({ policyId }) => Object({
                subjectId: resourceId, policyId
            }))).flattenDeep().value();
            await this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, beSignSubjects).then(contracts => {
                const contractMap = new Map(contracts.map(x => [x.subjectId + x.policyId, x.contractId]));
                model.resolveResources.forEach(resolveResource => resolveResource.contracts.forEach(resolveContractInfo => {
                    resolveContractInfo.contractId = contractMap.get(resolveResource.resourceId + resolveContractInfo.policyId) ?? '';
                }));
            });
        }
        const resourceVersion = await this.resourceVersionProvider.create(model);
        this.resourceVersionDraftProvider.deleteOne({ resourceId: resourceInfo.resourceId }).then();
        await this.resourceService.createdResourceVersionHandle(resourceInfo, resourceVersion);
        return resourceVersion;
    }
    /**
     * 更新资源版本
     * @param versionInfo
     * @param options
     */
    async updateResourceVersion(versionInfo, options) {
        const model = {};
        if (!lodash_1.isUndefined(options.description)) {
            model.description = options.description;
        }
        if (lodash_1.isArray(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(versionInfo.systemProperty, options.customPropertyDescriptors);
            model.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        // 更新合约代码较复杂,如果本次更新不牵扯到合约内容,则提前返回
        if (lodash_1.isUndefined(options.resolveResources) || lodash_1.isEmpty(options.resolveResources)) {
            return this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { new: true });
        }
        const invalidResolveResources = lodash_1.differenceBy(options.resolveResources, versionInfo.resolveResources, 'resourceId');
        if (!lodash_1.isEmpty(invalidResolveResources)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), { invalidResolveResources });
        }
        const beSignSubjects = lodash_1.chain(options.resolveResources).map(({ resourceId, contracts }) => contracts.map(({ policyId }) => Object({
            subjectId: resourceId, policyId
        }))).flattenDeep().value();
        const contractMap = await this.outsideApiService.batchSignResourceContracts(versionInfo.resourceId, beSignSubjects).then(contracts => {
            return new Map(contracts.map(x => [x.subjectId + x.policyId, x.contractId]));
        });
        options.resolveResources.forEach(resolveResource => resolveResource.contracts.forEach(item => {
            item.contractId = contractMap.get(resolveResource.resourceId + item.policyId) ?? '';
        }));
        model.resolveResources = versionInfo.resolveResources.map(resolveResource => {
            const modifyResolveResource = options.resolveResources.find(x => x.resourceId === resolveResource.resourceId);
            return modifyResolveResource ? lodash_1.assign(resolveResource, modifyResolveResource) : resolveResource;
        });
        return this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { new: true });
    }
    /**
     * 保存资源草稿
     * @param resourceInfo
     * @param draftData
     */
    async saveOrUpdateResourceVersionDraft(resourceInfo, draftData) {
        const model = {
            resourceId: resourceInfo.resourceId,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            draftData: draftData ?? {}
        };
        return this.resourceVersionDraftProvider.findOneAndUpdate({ resourceId: resourceInfo.resourceId }, model, { new: true }).then(data => {
            return data ?? this.resourceVersionDraftProvider.create(model);
        });
    }
    /**
     * 获取资源版本草稿
     * @param {string} resourceId
     * @returns {Promise<any>}
     */
    async getResourceVersionDraft(resourceId) {
        return this.resourceVersionDraftProvider.findOne({ resourceId });
    }
    /**
     * 获取资源文件流
     * @param versionInfo
     */
    async getResourceFileStream(versionInfo) {
        const stream = await this.outsideApiService.getFileStream(versionInfo.fileSha1);
        if ((stream.res.headers['content-type'] ?? '').includes('application/json')) {
            throw new egg_freelog_base_1.ApplicationError('文件读取失败', { msg: JSON.parse(stream.data.toString())?.msg });
        }
        if (!stream.res.statusCode.toString().startsWith('2')) {
            throw new egg_freelog_base_1.ApplicationError('文件读取失败');
        }
        let extName = '';
        if (lodash_1.isString(versionInfo.filename)) {
            extName = versionInfo.filename.substr(versionInfo.filename.lastIndexOf('.'));
        }
        return {
            fileSha1: versionInfo.fileSha1,
            contentType: versionInfo.systemProperty?.mime ?? 'application/octet-stream',
            fileName: `${versionInfo.resourceName}_${versionInfo.version}${extName}`,
            fileSize: versionInfo.systemProperty.fileSize,
            fileStream: stream.data
        };
    }
    /**
     * 检查文件是否可以被创建成资源的版本
     * @param fileSha1
     */
    async checkFileIsCanBeCreate(fileSha1) {
        return this.resourceVersionProvider.findOne({
            fileSha1, userId: { $ne: this.ctx.userId }
        }, '_id').then(x => !Boolean(x));
    }
    async find(condition, ...args) {
        return this.resourceVersionProvider.find(condition, ...args);
    }
    async findOne(condition, ...args) {
        return this.resourceVersionProvider.findOne(condition, ...args);
    }
    async findOneByVersion(resourceId, version, ...args) {
        const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceId, version);
        return this.findOne({ versionId }, ...args);
    }
    /**
     * 批量签约并且应用到版本中
     * @param resourceInfo
     * @param subjects
     */
    async batchSetPolicyToVersions(resourceInfo, subjects) {
        const toBeModifyVersions = [];
        const toBeSignSubjects = [];
        const versionModifyPolicyMap = new Map();
        subjects.forEach(subject => subject.versions.forEach(({ version, policyId, operation }) => {
            if (!versionModifyPolicyMap.has(version)) {
                toBeModifyVersions.push(version);
                versionModifyPolicyMap.set(version, []);
            }
            versionModifyPolicyMap.get(version).push({ subjectId: subject.subjectId, policyId, operation });
        }));
        const invalidVersions = lodash_1.differenceWith(toBeModifyVersions, resourceInfo.resourceVersions, (x, y) => x === y.version);
        if (!lodash_1.isEmpty(invalidVersions)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), { invalidVersions });
        }
        const invalidSubjects = [];
        const versionIds = lodash_1.intersectionWith(resourceInfo.resourceVersions, toBeModifyVersions, (x, y) => x.version === y).map(x => x.versionId);
        const resourceVersionMap = await this.find({ versionId: { $in: versionIds } }, 'version versionId resolveResources').then(list => new Map(list.map(x => [x.version, x])));
        for (let [version, subjectInfos] of versionModifyPolicyMap) {
            const resolveResources = resourceVersionMap.get(version)?.resolveResources ?? [];
            subjectInfos.forEach(({ subjectId, policyId, operation }) => {
                if (operation === 1 && !toBeSignSubjects.some(x => x.subjectId == subjectId && x.policyId === policyId)) {
                    toBeSignSubjects.push({ subjectId, policyId });
                }
                if (!resolveResources.some(x => x.resourceId === subjectId)) {
                    invalidSubjects.push({ subjectId, policyId, version });
                }
            });
        }
        if (!lodash_1.isEmpty(invalidSubjects)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), { invalidSubjects });
        }
        const contractMap = await this.outsideApiService.batchSignResourceContracts(resourceInfo.resourceId, toBeSignSubjects).then(list => {
            return new Map(list.map(x => [x.subjectId + x.policyId, x.contractId]));
        });
        const tasks = [], cancelFailedPolicies = [];
        for (let [version, subjectInfos] of versionModifyPolicyMap) {
            const resourceVersionInfo = resourceVersionMap.get(version);
            resourceVersionInfo.resolveResources.forEach(resolveResource => {
                const modifySubjects = subjectInfos.filter(x => x.subjectId === resolveResource.resourceId);
                if (lodash_1.isEmpty(modifySubjects)) {
                    return;
                }
                modifySubjects.forEach(({ subjectId, policyId, operation }) => {
                    if (operation === 0) {
                        resolveResource.contracts = resolveResource.contracts.filter(x => x.policyId !== policyId);
                        return;
                    }
                    const contractId = contractMap.get(subjectId + policyId) ?? '';
                    const modifyContract = resolveResource.contracts.find(x => x.policyId === policyId);
                    if (modifyContract) {
                        modifyContract.contractId = contractId;
                    }
                    else {
                        resolveResource.contracts.push({ policyId, contractId });
                    }
                });
            });
            if (resourceVersionInfo.resolveResources.some(x => lodash_1.isEmpty(x.contracts))) {
                cancelFailedPolicies.push({
                    version: version,
                    subjectInfos: subjectInfos.filter(x => x.operation === 0)
                });
            }
            else {
                tasks.push(this.resourceVersionProvider.updateOne({
                    versionId: resourceVersionInfo.versionId
                }, { resolveResources: resourceVersionInfo.resolveResources }));
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
    async validateDependencies(resourceId, dependencies) {
        if (lodash_1.isEmpty(dependencies)) {
            return dependencies;
        }
        if (dependencies.length !== lodash_1.uniqBy(dependencies, 'resourceId').length) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), { dependencies });
        }
        const cycleDependCheckResult = await this.cycleDependCheck(resourceId, dependencies || [], 1);
        if (cycleDependCheckResult.ret) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-circular-dependency-error'), {
                resourceId, deep: cycleDependCheckResult.deep
            });
        }
        const dependResourceMap = await this.resourceService.find({ _id: { $in: dependencies.map(x => x.resourceId) } })
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
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), { invalidDependencies });
        }
        if (invalidResourceVersionRanges.length) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-versionRange-invalid'), { invalidResourceVersionRanges });
        }
        return dependencies;
    }
    /**
     * 循坏依赖检查
     * @param resourceId
     * @param dependencies
     * @param deep
     */
    async cycleDependCheck(resourceId, dependencies, deep) {
        if (deep > 20) {
            throw new egg_freelog_base_1.ApplicationError('资源嵌套层级超过系统限制');
        }
        if (lodash_1.isEmpty(dependencies)) {
            return { ret: false };
        }
        if (dependencies.some(x => x.resourceId === resourceId)) {
            return { ret: true, deep };
        }
        const dependVersionIdSet = new Set();
        const dependResourceInfos = await this.resourceService.find({ _id: { $in: dependencies.map(x => x.resourceId) } }, 'resourceVersions');
        dependResourceInfos.forEach(resourceInfo => resourceInfo.resourceVersions.forEach(({ version }) => {
            dependVersionIdSet.add(this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, version));
        }));
        if (!dependVersionIdSet.size) {
            return { ret: false };
        }
        const dependVersionInfos = await this.resourceVersionProvider.find({ versionId: { $in: [...dependVersionIdSet.values()] } }, 'dependencies');
        const dependSubResources = lodash_1.chain(dependVersionInfos).map(m => m.dependencies).flattenDeep().value();
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
        const { upcastResources, backlogResources, allUntreatedResources } = await this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources);
        // 第一个发行方案需要检查基础上抛是否在范围内
        if (isCheckBaseUpcast) {
            const invalidBaseUpcastResources = lodash_1.differenceBy(baseUpcastResources, upcastResources, 'resourceId');
            if (invalidBaseUpcastResources.length) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-upcast-validate-failed'), { invalidBaseUpcastResources });
            }
        }
        // 未解决的发行(待办发行没有全部解决)
        const untreatedResources = lodash_1.differenceBy(backlogResources, resolveResources, x => x['resourceId']);
        if (untreatedResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), { untreatedResources });
        }
        // 无效的解决(不在待办发行中)
        const invalidResolveResources = lodash_1.differenceBy(resolveResources, backlogResources, 'resourceId');
        if (invalidResolveResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('params-validate-failed', 'resolveResources'), { invalidResolveResources });
        }
        const resourceMap = new Map(allUntreatedResources.map(x => [x['resourceId'], x['resourceName']]));
        resolveResources.forEach(item => item.resourceName = resourceMap.get(item.resourceId));
        return { resolveResources, upcastResources };
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
    async _getRealUpcastAndResolveResources(dependencies, baseUpcastResources) {
        let upcastResources = [];
        let backlogResources = [];
        let allUntreatedResources = [];
        if (!dependencies.length) {
            return { upcastResources, backlogResources, allUntreatedResources };
        }
        const dependResources = await this.resourceService.find({ _id: { $in: dependencies.map(x => x.resourceId) } });
        const invalidResources = dependResources.filter(x => x.status !== 1);
        if (invalidResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-release-invalid'), { invalidResources });
        }
        allUntreatedResources = lodash_1.chain(dependResources).map(x => x.baseUpcastResources)
            .flattenDeep().concat(dependencies).uniqBy('resourceId').map(x => lodash_1.pick(x, ['resourceId', 'resourceName'])).value();
        // 真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
        backlogResources = lodash_1.differenceBy(allUntreatedResources, baseUpcastResources, x => x['resourceId']);
        upcastResources = lodash_1.differenceBy(allUntreatedResources, backlogResources, x => x['resourceId']);
        return { allUntreatedResources, backlogResources, upcastResources };
    }
    /**
     * 校验自定义属性描述器
     * @param systemProperty
     * @param customPropertyDescriptors
     * @private
     */
    _checkCustomPropertyDescriptors(systemProperty, customPropertyDescriptors) {
        const systemPropertyKeys = Object.keys(systemProperty ?? {});
        const customPropertyKeys = customPropertyDescriptors?.map(x => x.key);
        const repetitiveKeys = lodash_1.intersection(systemPropertyKeys, customPropertyKeys);
        if (!lodash_1.isEmpty(repetitiveKeys)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('params-validate-failed', 'customPropertyDescriptors'), { repetitiveKeys });
        }
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceVersionProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourcePropertyGenerator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceVersionDraftProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "outsideApiService", void 0);
ResourceVersionService = __decorate([
    midway_1.provide('resourceVersionService')
], ResourceVersionService);
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBTWpDLHVEQUFvRztBQUNwRyxtQ0FLZ0I7QUFHaEIsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFlL0I7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsWUFBMEIsRUFBRSxPQUFxQztRQUV6RixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRSxNQUFNLGNBQWMsR0FBRyxnQkFBTyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlELE1BQU0sRUFBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRTFPLE1BQU0sS0FBSyxHQUF3QjtZQUMvQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO1lBQ25DLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWTtZQUN2QyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsWUFBWSxFQUFFLFlBQVksQ0FBQyxZQUFZO1lBQ3ZDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQ2xDLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxnQkFBZ0I7WUFDaEIsZUFBZSxFQUFFLGVBQXFDO1lBQ3RELGNBQWMsRUFBRSxPQUFPLENBQUMsY0FBcUI7WUFDN0MseUJBQXlCLEVBQUUsT0FBTyxDQUFDLHlCQUF5QjtZQUM1RCxTQUFTLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUNoSCxDQUFDO1FBRUYsSUFBSSxnQkFBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUN6RztRQUVELElBQUksQ0FBQyxnQkFBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDNUIsTUFBTSxjQUFjLEdBQUcsY0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2pILFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUTthQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM5RyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBaUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO29CQUN0RyxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEgsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxFQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxRixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXZGLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFdBQWdDLEVBQUUsT0FBcUM7UUFDL0YsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxvQkFBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNuQyxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDM0M7UUFDRCxJQUFJLGdCQUFPLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDcEcsS0FBSyxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQztTQUN2RTtRQUNELGlDQUFpQztRQUNqQyxJQUFJLG9CQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksZ0JBQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUM1RSxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7U0FDaEg7UUFFRCxNQUFNLHVCQUF1QixHQUFHLHFCQUFZLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuSCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO1lBQ25DLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxxREFBcUQsQ0FBQyxFQUFFLEVBQUMsdUJBQXVCLEVBQUMsQ0FBQyxDQUFDO1NBQ2xJO1FBRUQsTUFBTSxjQUFjLEdBQUcsY0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ3pILFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUTtTQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTNCLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2pJLE9BQU8sSUFBSSxHQUFHLENBQWlCLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pGLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEYsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQ3hFLE1BQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlHLE9BQU8scUJBQXFCLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxlQUFlLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVMsRUFBQyxFQUFFLEtBQUssRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2pILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLFlBQTBCLEVBQUUsU0FBaUI7UUFFaEYsTUFBTSxLQUFLLEdBQUc7WUFDVixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzNCLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWTtZQUN2QyxTQUFTLEVBQUUsU0FBUyxJQUFJLEVBQUU7U0FDN0IsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLGdCQUFnQixDQUFDLEVBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUMsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0gsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFVBQWtCO1FBQzVDLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxXQUFnQztRQUV4RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUN6RSxNQUFNLElBQUksbUNBQWdCLENBQUMsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7U0FDeEY7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25ELE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLGlCQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTztZQUNILFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUTtZQUM5QixXQUFXLEVBQUUsV0FBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLElBQUksMEJBQTBCO1lBQzNFLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLE9BQU8sR0FBRyxPQUFPLEVBQUU7WUFDeEUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsUUFBUTtZQUM3QyxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUk7U0FDMUIsQ0FBQTtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBZ0I7UUFDekMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDO1lBQ3hDLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUM7U0FDM0MsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNwQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLE9BQWUsRUFBRSxHQUFHLElBQUk7UUFDL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFlBQTBCLEVBQUUsUUFBZTtRQUV0RSxNQUFNLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztRQUN4QyxNQUFNLGdCQUFnQixHQUFrQixFQUFFLENBQUM7UUFDM0MsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztRQUNoRSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRTtZQUNwRixJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN0QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDM0M7WUFDRCxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sZUFBZSxHQUFHLHVCQUFjLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNySCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUMzQixNQUFNLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUM7U0FDdEc7UUFFRCxNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDM0IsTUFBTSxVQUFVLEdBQUcseUJBQWdCLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEksTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLEVBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEssS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxJQUFJLHNCQUFzQixFQUFFO1lBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztZQUNqRixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxFQUFFLEVBQUU7Z0JBQ3RELElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksU0FBUyxJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEVBQUU7b0JBQ3JHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2lCQUNoRDtnQkFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsRUFBRTtvQkFDekQsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztpQkFDeEQ7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQ0QsSUFBSSxDQUFDLGdCQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDM0IsTUFBTSxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDO1NBQ3RHO1FBQ0QsTUFBTSxXQUFXLEdBQXdCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEosT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLEVBQUUsRUFBRSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7UUFDNUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxJQUFJLHNCQUFzQixFQUFFO1lBQ3hELE1BQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVELG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDM0QsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLGdCQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQ3pCLE9BQU87aUJBQ1Y7Z0JBQ0QsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFFO29CQUN4RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7d0JBQ2pCLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO3dCQUMzRixPQUFPO3FCQUNWO29CQUNELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDL0QsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO29CQUNwRixJQUFJLGNBQWMsRUFBRTt3QkFDaEIsY0FBYyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7cUJBQzFDO3lCQUFNO3dCQUNILGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7cUJBQzFEO2dCQUNMLENBQUMsQ0FBQyxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUE7WUFDRixJQUFJLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGdCQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLG9CQUFvQixDQUFDLElBQUksQ0FBQztvQkFDdEIsT0FBTyxFQUFFLE9BQU87b0JBQ2hCLFlBQVksRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUM7aUJBQzVELENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQztvQkFDOUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7aUJBQzNDLEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUNqRTtTQUNKO1FBRUQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxZQUFZO1FBRS9DLElBQUksZ0JBQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUVELElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxlQUFNLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNuRSxNQUFNLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUMsWUFBWSxFQUFDLENBQUMsQ0FBQztTQUNoRztRQUVELE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFlBQVksSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUYsSUFBSSxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLEVBQUU7Z0JBQzlFLFVBQVUsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLENBQUMsSUFBSTthQUNoRCxDQUFDLENBQUM7U0FDTjtRQUVELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEVBQUMsQ0FBQzthQUN2RyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTdELE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1FBQy9CLE1BQU0sNEJBQTRCLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1QyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3JDLE9BQU87YUFDVjtZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUU7Z0JBQ25HLDRCQUE0QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNqRDtZQUNELFVBQVUsQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFO1lBQzVCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsRUFBQyxtQkFBbUIsRUFBQyxDQUFDLENBQUM7U0FDdkc7UUFDRCxJQUFJLDRCQUE0QixDQUFDLE1BQU0sRUFBRTtZQUNyQyxNQUFNLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxFQUFFLEVBQUMsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO1NBQzdIO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsWUFBbUIsRUFBRSxJQUFZO1FBRXhFLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRTtZQUNYLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksZ0JBQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QixPQUFPLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsRUFBRTtZQUNyRCxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUM1QjtRQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBQyxFQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNuSSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFFO1lBQzVGLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFO1lBQzFCLE9BQU8sRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDdkI7UUFFRCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxFQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDekksTUFBTSxrQkFBa0IsR0FBRyxjQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEcsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsR0FBRyxLQUFLO1FBRWxILDhDQUE4QztRQUM5QyxNQUFNLEVBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFFbkosd0JBQXdCO1FBQ3hCLElBQUksaUJBQWlCLEVBQUU7WUFDbkIsTUFBTSwwQkFBMEIsR0FBRyxxQkFBWSxDQUFDLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNwRyxJQUFJLDBCQUEwQixDQUFDLE1BQU0sRUFBRTtnQkFDbkMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLEVBQUUsRUFBQywwQkFBMEIsRUFBQyxDQUFDLENBQUM7YUFDdkg7U0FDSjtRQUVELHFCQUFxQjtRQUNyQixNQUFNLGtCQUFrQixHQUFHLHFCQUFZLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNsRyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtZQUMzQixNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsMERBQTBELENBQUMsRUFBRSxFQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQztTQUNsSTtRQUVELGlCQUFpQjtRQUNqQixNQUFNLHVCQUF1QixHQUFHLHFCQUFZLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0YsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEVBQUU7WUFDaEMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLGtCQUFrQixDQUFDLEVBQUUsRUFBQyx1QkFBdUIsRUFBQyxDQUFDLENBQUM7U0FDekg7UUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRXZGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxtQkFBbUI7UUFFckUsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUkscUJBQXFCLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUMsQ0FBQztTQUNyRTtRQUVELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUMzRyxNQUFNLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO1NBQ3ZHO1FBRUQscUJBQXFCLEdBQUcsY0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQzthQUN6RSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXZILGlEQUFpRDtRQUNqRCxnQkFBZ0IsR0FBRyxxQkFBWSxDQUFDLHFCQUFxQixFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDbEcsZUFBZSxHQUFHLHFCQUFZLENBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUU5RixPQUFPLEVBQUMscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsK0JBQStCLENBQUMsY0FBc0IsRUFBRSx5QkFBZ0M7UUFDcEYsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM3RCxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RSxNQUFNLGNBQWMsR0FBRyxxQkFBWSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLGdCQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDMUIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLDJCQUEyQixDQUFDLEVBQUUsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFBO1NBQ3hIO0lBQ0wsQ0FBQztDQUNKLENBQUE7QUF2Ykc7SUFEQyxlQUFNLEVBQUU7O21EQUNXO0FBRXBCO0lBREMsZUFBTSxFQUFFOzsrREFDTztBQUVoQjtJQURDLGVBQU0sRUFBRTs7dUVBQ3VEO0FBRWhFO0lBREMsZUFBTSxFQUFFOzt5RUFDaUI7QUFFMUI7SUFEQyxlQUFNLEVBQUU7OzRFQUNvQjtBQUU3QjtJQURDLGVBQU0sRUFBRTs7aUVBQzZCO0FBYjdCLHNCQUFzQjtJQURsQyxnQkFBTyxDQUFDLHdCQUF3QixDQUFDO0dBQ3JCLHNCQUFzQixDQTBibEM7QUExYlksd0RBQXNCIn0=