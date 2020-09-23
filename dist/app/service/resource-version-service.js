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
        const { resolveResources, upcastResources } = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources);
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
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<void>}
     */
    async updateResourceVersion(versionInfo, options) {
        const model = {};
        if (!lodash_1.isUndefined(options.description)) {
            model.description = options.description;
        }
        if (!lodash_1.isUndefined(options.customPropertyDescriptors)) {
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
     * @param {ResourceInfo} resourceInfo
     * @param {CreateResourceVersionOptions} options
     * @returns {Promise<any>}
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
     * @param resourceId
     * @param version
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
     * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param ctx
     * @param dependencies
     * @returns {Promise<any>}
     * @private
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
     * @param {number} deep
     * @returns {Promise<{ret: boolean; deep?: number}>}
     * @private
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
     * @param baseUpcastReleases
     * @param {boolean} isCheckBaseUpcast
     * @returns {Promise<{resolveResources: any; upcastResources: object[]}>}
     * @private
     */
    async _validateUpcastAndResolveResource(dependencies, resolveResources, baseUpcastResources) {
        // 检查发行有效性,策略有效性,上抛发行是否合理,声明处理的发行是否合理以及未处理的依赖项
        const { upcastResources, backlogResources, allUntreatedResources } = await this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources);
        // 第一个发行方案需要检查基础上抛是否在范围内
        const invalidBaseUpcastResources = lodash_1.differenceBy(baseUpcastResources, upcastResources, 'resourceId');
        if (invalidBaseUpcastResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-upcast-validate-failed'), { invalidBaseUpcastResources });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBTWpDLHVEQUFpRTtBQUNqRSxtQ0FLZ0I7QUFHaEIsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFlL0I7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsWUFBMEIsRUFBRSxPQUFxQztRQUV6RixNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRSxNQUFNLGNBQWMsR0FBRyxnQkFBTyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlELE1BQU0sRUFBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFMU4sTUFBTSxLQUFLLEdBQXdCO1lBQy9CLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsWUFBWSxFQUFFLFlBQVksQ0FBQyxZQUFZO1lBQ3ZDLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMzQixZQUFZLEVBQUUsWUFBWSxDQUFDLFlBQVk7WUFDdkMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7WUFDbEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLGdCQUFnQjtZQUNoQixlQUFlLEVBQUUsZUFBcUM7WUFDdEQsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1lBQ3RDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyx5QkFBeUI7WUFDNUQsU0FBUyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUM7U0FDaEgsQ0FBQztRQUVGLElBQUksQ0FBQyxnQkFBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDNUIsTUFBTSxjQUFjLEdBQUcsY0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2pILFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUTthQUNsQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM5RyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBaUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO29CQUN0RyxtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEgsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxFQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxRixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsNEJBQTRCLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXZGLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFdBQWdDLEVBQUUsT0FBcUM7UUFDL0YsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxvQkFBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNuQyxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDM0M7UUFDRCxJQUFJLENBQUMsb0JBQVcsQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsRUFBRTtZQUNqRCxLQUFLLENBQUMseUJBQXlCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDO1NBQ3ZFO1FBQ0QsaUNBQWlDO1FBQ2pDLElBQUksb0JBQVcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQzVFLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLEVBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLEVBQUMsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztTQUNoSDtRQUVELE1BQU0sdUJBQXVCLEdBQUcscUJBQVksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25ILElBQUksQ0FBQyxnQkFBTyxDQUFDLHVCQUF1QixDQUFDLEVBQUU7WUFDbkMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHFEQUFxRCxDQUFDLEVBQUUsRUFBQyx1QkFBdUIsRUFBQyxDQUFDLENBQUM7U0FDbEk7UUFFRCxNQUFNLGNBQWMsR0FBRyxjQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDekgsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRO1NBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFM0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDakksT0FBTyxJQUFJLEdBQUcsQ0FBaUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakcsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekYsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4RixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosS0FBSyxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDeEUsTUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUcsT0FBTyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLGVBQWUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFDcEcsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDakgsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLFlBQTBCLEVBQUUsU0FBaUI7UUFFaEYsTUFBTSxLQUFLLEdBQUc7WUFDVixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzNCLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWTtZQUN2QyxTQUFTLEVBQUUsU0FBUyxJQUFJLEVBQUU7U0FDN0IsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLGdCQUFnQixDQUFDLEVBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUMsRUFBRSxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0gsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFVBQWtCO1FBQzVDLE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsV0FBZ0M7UUFFeEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDekUsTUFBTSxJQUFJLG1DQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1NBQ3hGO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNuRCxNQUFNLElBQUksbUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEM7UUFFRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxpQkFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNoQyxPQUFPLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU87WUFDSCxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVE7WUFDOUIsUUFBUSxFQUFFLEdBQUcsV0FBVyxDQUFDLFlBQVksSUFBSSxXQUFXLENBQUMsT0FBTyxHQUFHLE9BQU8sRUFBRTtZQUN4RSxRQUFRLEVBQUUsV0FBVyxDQUFDLGNBQWMsQ0FBQyxRQUFRO1lBQzdDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSTtTQUMxQixDQUFBO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxRQUFnQjtRQUN6QyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUM7WUFDeEMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQztTQUMzQyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFDakMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsT0FBZSxFQUFFLEdBQUcsSUFBSTtRQUMvRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFNBQVMsRUFBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsd0JBQXdCLENBQUMsWUFBMEIsRUFBRSxRQUFlO1FBRXRFLE1BQU0sa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sZ0JBQWdCLEdBQWtCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBQ2hFLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFFO1lBQ3BGLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQzthQUMzQztZQUNELHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxlQUFlLEdBQUcsdUJBQWMsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JILElBQUksQ0FBQyxnQkFBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUMsZUFBZSxFQUFDLENBQUMsQ0FBQztTQUN0RztRQUVELE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUMzQixNQUFNLFVBQVUsR0FBRyx5QkFBZ0IsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4SSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsRUFBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0SyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksc0JBQXNCLEVBQUU7WUFDeEQsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLElBQUksRUFBRSxDQUFDO1lBQ2pGLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLEVBQUUsRUFBRTtnQkFDdEQsSUFBSSxTQUFTLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsRUFBRTtvQkFDckcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7aUJBQ2hEO2dCQUNELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxFQUFFO29CQUN6RCxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO2lCQUN4RDtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUMzQixNQUFNLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFDLGVBQWUsRUFBQyxDQUFDLENBQUM7U0FDdEc7UUFDRCxNQUFNLFdBQVcsR0FBd0IsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwSixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxLQUFLLEdBQUcsRUFBRSxFQUFFLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztRQUM1QyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksc0JBQXNCLEVBQUU7WUFDeEQsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUQsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUMzRCxNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVGLElBQUksZ0JBQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDekIsT0FBTztpQkFDVjtnQkFDRCxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxFQUFFLEVBQUU7b0JBQ3hELElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTt3QkFDakIsZUFBZSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7d0JBQzNGLE9BQU87cUJBQ1Y7b0JBQ0QsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUMvRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7b0JBQ3BGLElBQUksY0FBYyxFQUFFO3dCQUNoQixjQUFjLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztxQkFDMUM7eUJBQU07d0JBQ0gsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztxQkFDMUQ7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7WUFDTixDQUFDLENBQUMsQ0FBQTtZQUNGLElBQUksbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtnQkFDdEUsb0JBQW9CLENBQUMsSUFBSSxDQUFDO29CQUN0QixPQUFPLEVBQUUsT0FBTztvQkFDaEIsWUFBWSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQztpQkFDNUQsQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDO29CQUM5QyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsU0FBUztpQkFDM0MsRUFBRSxFQUFDLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pFO1NBQ0o7UUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsWUFBWTtRQUUvQyxJQUFJLGdCQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdkIsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssZUFBTSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDbkUsTUFBTSxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUM7U0FDaEc7UUFFRCxNQUFNLHNCQUFzQixHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxZQUFZLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksc0JBQXNCLENBQUMsR0FBRyxFQUFFO1lBQzVCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxFQUFFO2dCQUM5RSxVQUFVLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixDQUFDLElBQUk7YUFDaEQsQ0FBQyxDQUFDO1NBQ047UUFFRCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBQyxFQUFDLENBQUM7YUFDdkcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3RCxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUMvQixNQUFNLDRCQUE0QixHQUFHLEVBQUUsQ0FBQztRQUN4QyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzlCLE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPO2FBQ1Y7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFO2dCQUNuRyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDakQ7WUFDRCxVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtZQUM1QixNQUFNLElBQUksZ0NBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUFDO1NBQ3ZHO1FBQ0QsSUFBSSw0QkFBNEIsQ0FBQyxNQUFNLEVBQUU7WUFDckMsTUFBTSxJQUFJLGdDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsOENBQThDLENBQUMsRUFBRSxFQUFDLDRCQUE0QixFQUFDLENBQUMsQ0FBQztTQUM3SDtRQUVELE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsWUFBbUIsRUFBRSxJQUFZO1FBRXhFLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRTtZQUNYLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksZ0JBQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QixPQUFPLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsRUFBRTtZQUNyRCxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUM1QjtRQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBQyxFQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNuSSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFFO1lBQzVGLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFO1lBQzFCLE9BQU8sRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDdkI7UUFFRCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxFQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDekksTUFBTSxrQkFBa0IsR0FBRyxjQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEcsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxLQUFLLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQjtRQUV2Riw4Q0FBOEM7UUFDOUMsTUFBTSxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRW5KLHdCQUF3QjtRQUN4QixNQUFNLDBCQUEwQixHQUFHLHFCQUFZLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3BHLElBQUksMEJBQTBCLENBQUMsTUFBTSxFQUFFO1lBQ25DLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFFLEVBQUMsMEJBQTBCLEVBQUMsQ0FBQyxDQUFDO1NBQ3ZIO1FBRUQscUJBQXFCO1FBQ3JCLE1BQU0sa0JBQWtCLEdBQUcscUJBQVksQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywwREFBMEQsQ0FBQyxFQUFFLEVBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO1NBQ2xJO1FBRUQsaUJBQWlCO1FBQ2pCLE1BQU0sdUJBQXVCLEdBQUcscUJBQVksQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMvRixJQUFJLHVCQUF1QixDQUFDLE1BQU0sRUFBRTtZQUNoQyxNQUFNLElBQUksbUNBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxFQUFDLHVCQUF1QixFQUFDLENBQUMsQ0FBQztTQUN6SDtRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFFdkYsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxLQUFLLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLG1CQUFtQjtRQUVyRSxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7WUFDdEIsT0FBTyxFQUFDLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxxQkFBcUIsRUFBQyxDQUFDO1NBQ3JFO1FBRUQsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQzNHLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckUsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7WUFDekIsTUFBTSxJQUFJLG1DQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUM7U0FDdkc7UUFFRCxxQkFBcUIsR0FBRyxjQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO2FBQ3pFLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdkgsaURBQWlEO1FBQ2pELGdCQUFnQixHQUFHLHFCQUFZLENBQUMscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNsRyxlQUFlLEdBQUcscUJBQVksQ0FBQyxxQkFBcUIsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRTlGLE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUMsQ0FBQztJQUN0RSxDQUFDO0NBQ0osQ0FBQTtBQXhhRztJQURDLGVBQU0sRUFBRTs7bURBQ0w7QUFFSjtJQURDLGVBQU0sRUFBRTs7K0RBQ087QUFFaEI7SUFEQyxlQUFNLEVBQUU7O3VFQUNlO0FBRXhCO0lBREMsZUFBTSxFQUFFOzt5RUFDaUI7QUFFMUI7SUFEQyxlQUFNLEVBQUU7OzRFQUNvQjtBQUU3QjtJQURDLGVBQU0sRUFBRTs7aUVBQzZCO0FBYjdCLHNCQUFzQjtJQURsQyxnQkFBTyxDQUFDLHdCQUF3QixDQUFDO0dBQ3JCLHNCQUFzQixDQTJhbEM7QUEzYVksd0RBQXNCIn0=