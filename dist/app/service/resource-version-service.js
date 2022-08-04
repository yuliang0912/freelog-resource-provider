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
            const beSignSubjects = (0, lodash_1.chain)(resolveResources)
                .map(({ resourceId, contracts }) => contracts.map(({ policyId }) => Object({
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
        this.outsideApiService.sendActivityEvent('TS000022', resourceInfo.userId).catch(console.error);
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
        const tasks = [];
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
            tasks.push(this.resourceVersionProvider.updateOne({
                versionId: resourceVersionInfo.versionId
            }, { resolveResources: resourceVersionInfo.resolveResources }));
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
     * 综合计算获得版本的最终属性
     * @param resourceVersionInfo
     * @returns {Promise<void>}
     */
    calculateResourceVersionProperty(resourceVersionInfo) {
        const resourceCustomReadonlyInfo = {};
        const resourceCustomEditableInfo = {};
        const customPropertyDescriptors = resourceVersionInfo.customPropertyDescriptors;
        customPropertyDescriptors?.forEach(({ key, defaultValue, type }) => {
            if (type === 'readonlyText') {
                resourceCustomReadonlyInfo[key] = defaultValue;
            }
            else {
                resourceCustomEditableInfo[key] = defaultValue;
            }
        });
        // 属性优先级为: 1.系统属性 2:资源定义的不可编辑的属性 3:资源自定义的可编辑属性
        return (0, lodash_1.assign)(resourceCustomEditableInfo, resourceCustomReadonlyInfo, resourceVersionInfo.systemProperty);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBTWpDLHVEQU0wQjtBQUMxQixtQ0FLZ0I7QUFDaEIsMEZBQW1GO0FBR25GLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBRy9CLEdBQUcsQ0FBaUI7SUFFcEIsZUFBZSxDQUFDO0lBRWhCLHVCQUF1QixDQUF5QztJQUVoRSx5QkFBeUIsQ0FBNEI7SUFFckQsNEJBQTRCLENBQUM7SUFFN0IsaUJBQWlCLENBQXFCO0lBRXRDOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQTBCLEVBQUUsT0FBcUM7UUFFekYsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN2SixNQUFNLGNBQWMsR0FBRyxJQUFBLGdCQUFPLEVBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUQsTUFBTSxFQUNGLGdCQUFnQixFQUNoQixlQUFlLEVBQ2xCLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRTFMLE1BQU0sS0FBSyxHQUF3QjtZQUMvQixPQUFPLEVBQUUs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