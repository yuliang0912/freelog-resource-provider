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
let ResourceVersionService = /** @class */ (() => {
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
    ResourceVersionService = __decorate([
        midway_1.provide('resourceVersionService')
    ], ResourceVersionService);
    return ResourceVersionService;
})();
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBS2pDLHVEQUFpRTtBQUNqRSxtQ0FBK0U7QUFHL0U7SUFBQSxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtRQVcvQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtZQUNwQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQTBCLEVBQUUsT0FBcUM7WUFFekYsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsTUFBTSxjQUFjLEdBQUcsZ0JBQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM5RCxNQUFNLEVBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFB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