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
    async find(condition, ...args) {
        return this.resourceVersionProvider.find(condition, ...args);
    }
    async findOne(condition, ...args) {
        return this.resourceVersionProvider.findOne(condition, ...args);
    }
    /**
     * 为资源创建版本
     * @param {ResourceInfo} resourceInfo 资源信息
     * @param {CreateResourceVersionOptions} options 更新选项
     * @returns {Promise<ResourceVersionInfo>}
     */
    async createResourceVersion(resourceInfo, options) {
        await this._validateDependencies(resourceInfo.resourceId, options.dependencies);
        const isFirstVersion = lodash_1.isEmpty(resourceInfo.resourceVersions);
        const { resolveResources, upcastResources } = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);
        const model = {
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
            upcastResources: upcastResources,
            systemProperty: options.systemProperty,
            customPropertyDescriptors: options.customPropertyDescriptors,
            status: 1
        };
        const resourceVersion = await this.resourceVersionProvider.create(model);
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
    async updateResourceVersion(versionInfo, options) {
        const model = {};
        if (!lodash_1.isUndefined(options.description)) {
            model.description = options.description;
        }
        if (!lodash_1.isUndefined(options.customPropertyDescriptors)) {
            model.customPropertyDescriptors = options.customPropertyDescriptors;
        }
        if (lodash_1.isEmpty(options.resolveResources) || lodash_1.isUndefined(options.resolveResources)) {
            return this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { new: true });
        }
        const invalidResolveResources = lodash_1.differenceBy(options.resolveResources, versionInfo.resolveResources, x => x['resourceId']);
        if (invalidResolveResources.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('release-scheme-update-resolve-release-invalid-error'), { invalidResolveResources });
        }
        const updatedResolveResources = versionInfo['toObject']().resolveResources;
        for (let i = 0, j = options.resolveResources.length; i < j; i++) {
            const { resourceId, contracts } = options.resolveResources[i];
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
        return this.resourceVersionProvider.findOneAndUpdate({ versionId: versionInfo.versionId }, model, { new: true });
    }
    /**
     * 资源批量签约
     * @param {ResourceVersionInfo} versionInfo
     * @param {any[]} changedResolveResources
     * @returns {Promise<any>}
     */
    async resourceBatchSignContract(versionInfo, changedResolveResources = []) {
        const { resourceId, resolveResources } = versionInfo;
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
    async saveOrUpdateResourceVersionDraft(resourceInfo, options) {
        await this._validateDependencies(resourceInfo.resourceId, options.dependencies);
        const isFirstVersion = lodash_1.isEmpty(resourceInfo.resourceVersions);
        const { resolveResources, upcastResources } = await this._validateUpcastAndResolveResource(options.dependencies, options.resolveResources, isFirstVersion ? options.baseUpcastResources : resourceInfo.baseUpcastResources, isFirstVersion);
        const model = {
            version: options.version,
            resourceId: resourceInfo.resourceId,
            userId: resourceInfo.userId,
            resourceType: resourceInfo.resourceType,
            fileSha1: options.fileSha1,
            dependencies: options.dependencies,
            description: options.description,
            resolveResources,
            upcastResources: upcastResources,
            customPropertyDescriptors: options.customPropertyDescriptors
        };
        return this.resourceVersionDraftProvider.findOneAndUpdate({ resourceId: resourceInfo.resourceId }, model, { new: true }).then(data => {
            return data || this.resourceVersionDraftProvider.create(model);
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
     * 检查依赖项是否符合标准
     * 1:依赖的资源不能重复,并且是上架状态
     * 2.依赖的资源与主资源之间不能存在循环引用.
     * 3.资源的依赖树深度不能超过固定阈值(20)
     * @param ctx
     * @param dependencies
     * @returns {Promise<any>}
     * @private
     */
    async _validateDependencies(resourceId, dependencies) {
        if (lodash_1.isEmpty(dependencies)) {
            return dependencies;
        }
        if (dependencies.length !== lodash_1.uniqBy(dependencies, 'resourceId').length) {
            throw new egg_freelog_base_1.ArgumentError(this.ctx.gettext('resource-depend-release-invalid'), { dependencies });
        }
        const cycleDependCheckResult = await this._cycleDependCheck(resourceId, dependencies || []);
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
    async _cycleDependCheck(resourceId, dependencies, deep = 1) {
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
        const { upcastResources, backlogResources, allUntreatedResources } = await this._getRealUpcastAndResolveResources(dependencies, baseUpcastResources);
        // 第一个发行方案需要检查基础上抛是否在范围内
        if (isCheckBaseUpcast) {
            const invalidBaseUpcastResources = lodash_1.differenceBy(baseUpcastResources, upcastResources, x => x['resourceId']);
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
        const invalidResolveResources = lodash_1.differenceBy(resolveResources, backlogResources, x => x['resourceId']);
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
            .flattenDeep().concat(dependencies).uniqBy(x => x.resoruceId).map(x => lodash_1.pick(x, ['resourceId', 'resourceName'])).value();
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
ResourceVersionService = __decorate([
    midway_1.provide('resourceVersionService')
], ResourceVersionService);
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBS2pDLHVEQUFpRTtBQUNqRSxtQ0FBK0U7QUFHL0UsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFhL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQUk7UUFDcEMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxZQUEwQixFQUFFLE9BQXFDO1FBRXpGLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sY0FBYyxHQUFHLGdCQUFPLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUQsTUFBTSxFQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsY0FB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