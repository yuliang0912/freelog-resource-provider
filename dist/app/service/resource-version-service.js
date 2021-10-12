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
const resource_property_generator_1 = require("../../extend/resource-property-generator");
let ResourceVersionService = class ResourceVersionService {
    ctx;
    resourceService;
    resourceVersionProvider;
    resourcePropertyGenerator;
    resourceVersionDraftProvider;
    outsideApiService;
    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    async createResourceVersion(resourceInfo, options) {
        const dependencies = await this._validateDependencies(resourceInfo.resourceId, options.dependencies, options?.resolveResources.map(x => x.resourceId));
        const isFirstVersion = (0, lodash_1.isEmpty)(resourceInfo.resourceVersions);
        const { resolveResources, upcastResources } = await this._validateUpcastAndResolveResource(dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);
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
        if ((0, lodash_1.isArray)(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(options.systemProperty ?? {}, options.customPropertyDescriptors);
        }
        if (!(0, lodash_1.isEmpty)(resolveResources)) {
            const beSignSubjects = (0, lodash_1.chain)(resolveResources).map(({ resourceId, contracts }) => contracts.map(({ policyId }) => Object({
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
        if (!(0, lodash_1.isUndefined)(options.description)) {
            model.description = options.description;
        }
        if ((0, lodash_1.isArray)(options.customPropertyDescriptors)) {
            this._checkCustomPropertyDescriptors(versionInfo.systemProperty, options.customPropertyDescriptors);
            model.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        // 更新合约代码较复杂,如果本次更新不牵扯到合约内容,则提前返回
        if ((0, lodash_1.isUndefined)(options.resolveResources) || (0, lodash_1.isEmpty)(options.resolveResources)) {
            return this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { new: true });
        }
        const invalidResolveResources = (0, lodash_1.differenceBy)(options.resolveResources, versionInfo.resolveResources, 'resourceId');
        if (!(0, lodash_1.isEmpty)(invalidResolveResources)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), { invalidResolveResources });
        }
        const beSignSubjects = (0, lodash_1.chain)(options.resolveResources).map(({ resourceId, contracts }) => contracts.map(({ policyId }) => Object({
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
            return modifyResolveResource ? (0, lodash_1.assign)(resolveResource, modifyResolveResource) : resolveResource;
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
        if (!stream.res.statusCode.toString().startsWith('2')) {
            this.ctx.status = stream.res.statusCode;
            this.ctx.body = stream.data.toString();
            throw new egg_freelog_base_1.BreakOffError();
        }
        let extName = '';
        if ((0, lodash_1.isString)(versionInfo.filename)) {
            extName = versionInfo.filename.substr(versionInfo.filename.lastIndexOf('.'));
        }
        return {
            fileSha1: versionInfo.fileSha1,
            contentType: versionInfo.systemProperty?.mime ?? this.resourcePropertyGenerator.getResourceMimeType(versionInfo.filename),
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
        const invalidVersions = (0, lodash_1.differenceWith)(toBeModifyVersions, resourceInfo.resourceVersions, (x, y) => x === y.version);
        if (!(0, lodash_1.isEmpty)(invalidVersions)) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('params-validate-failed', 'subjects'), { invalidVersions });
        }
        const invalidSubjects = [];
        const versionIds = (0, lodash_1.intersectionWith)(resourceInfo.resourceVersions, toBeModifyVersions, (x, y) => x.version === y).map(x => x.versionId);
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
        if (!(0, lodash_1.isEmpty)(invalidSubjects)) {
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
                if ((0, lodash_1.isEmpty)(modifySubjects)) {
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
            if (resourceVersionInfo.resolveResources.some(x => (0, lodash_1.isEmpty)(x.contracts))) {
                cancelFailedPolicies.push({
                    version, subjectInfos: subjectInfos.filter(x => x.operation === 0)
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
     * 循坏依赖检查
     * @param resourceId
     * @param dependencies
     * @param deep
     */
    async cycleDependCheck(resourceId, dependencies, deep) {
        if (deep > 20) {
            throw new egg_freelog_base_1.ApplicationError('资源嵌套层级超过系统限制');
        }
        if ((0, lodash_1.isEmpty)(dependencies)) {
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
        const dependSubResources = (0, lodash_1.chain)(dependVersionInfos).map(m => m.dependencies).flattenDeep().value();
        return this.cycleDependCheck(resourceId, dependSubResources, deep + 1);
    }
    /**
     * * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param resourceId
     * @param dependencies
     * @param resolveResourceIds
     */
    async _validateDependencies(resourceId, dependencies, resolveResourceIds) {
        if ((0, lodash_1.isEmpty)(dependencies)) {
            return dependencies;
        }
        if (dependencies.length !== (0, lodash_1.uniqBy)(dependencies, 'resourceId').length) {
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
            if (!resourceInfo || (resourceInfo.status !== 1 && !resolveResourceIds.includes(resourceInfo.resourceId))) {
                invalidDependencies.push(dependency);
                return;
            }
            if (!resourceInfo.resourceVersions.some(x => semver.satisfies(x['version'], dependency.versionRange))) {
                invalidResourceVersionRanges.push(dependency);
            }
            dependency.resourceName = resourceInfo.resourceName;
            dependency.baseUpcastResources = resourceInfo.baseUpcastResources;
            dependency.resourceVersions = resourceInfo.resourceVersions;
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
            const invalidBaseUpcastResources = (0, lodash_1.differenceBy)(baseUpcastResources, upcastResources, 'resourceId');
            if (invalidBaseUpcastResources.length) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-upcast-validate-failed'), { invalidBaseUpcastResources });
            }
        }
        // 未解决的发行(待办发行没有全部解决)
        const untreatedResources = (0, lodash_1.differenceBy)(backlogResources, resolveResources, x => x['resourceId']);
        if (untreatedResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('resource-depend-upcast-resolve-integrity-validate-failed'), { untreatedResources });
        }
        // 无效的解决(不在待办发行中)
        const invalidResolveResources = (0, lodash_1.differenceBy)(resolveResources, backlogResources, 'resourceId');
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
        allUntreatedResources = (0, lodash_1.chain)(dependencies).map(x => x.baseUpcastResources)
            .flattenDeep().concat(dependencies).uniqBy('resourceId').map(x => (0, lodash_1.pick)(x, ['resourceId', 'resourceName'])).value();
        // 真实需要解决的和需要上抛的(实际后续版本真实上抛可能会比基础上抛少,考虑以后授权可能会用到)
        backlogResources = (0, lodash_1.differenceBy)(allUntreatedResources, baseUpcastResources, x => x['resourceId']);
        upcastResources = (0, lodash_1.differenceBy)(allUntreatedResources, backlogResources, x => x['resourceId']);
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
        const repetitiveKeys = (0, lodash_1.intersection)(systemPropertyKeys, customPropertyKeys);
        if (!(0, lodash_1.isEmpty)(repetitiveKeys)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('params-validate-failed', 'customPropertyDescriptors'), { repetitiveKeys });
        }
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceVersionProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", resource_property_generator_1.ResourcePropertyGenerator)
], ResourceVersionService.prototype, "resourcePropertyGenerator", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceVersionDraftProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "outsideApiService", void 0);
ResourceVersionService = __decorate([
    (0, midway_1.provide)('resourceVersionService')
], ResourceVersionService);
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBTWpDLHVEQU0wQjtBQUMxQixtQ0FLZ0I7QUFDaEIsMEZBQW1GO0FBR25GLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBRy9CLEdBQUcsQ0FBaUI7SUFFcEIsZUFBZSxDQUFDO0lBRWhCLHVCQUF1QixDQUF5QztJQUVoRSx5QkFBeUIsQ0FBNEI7SUFFckQsNEJBQTRCLENBQUM7SUFFN0IsaUJBQWlCLENBQXFCO0lBRXRDOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQTBCLEVBQUUsT0FBcUM7UUFFekYsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN2SixNQUFNLGNBQWMsR0FBRyxJQUFBLGdCQUFPLEVBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUQsTUFBTSxFQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVsTyxNQUFNLEtBQUssR0FBd0I7WUFDL0IsT0FBTyxFQUFFLE9B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