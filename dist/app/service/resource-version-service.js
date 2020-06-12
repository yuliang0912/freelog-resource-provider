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
                systemProperties: [],
                customPropertyDescriptors: options.customPropertyDescriptors,
                status: 1
            };
            await await this.resourceFilePropertyGenerator.getResourceFileProperty({
                fileUrl: options.fileUrl,
                fileSize: options.fileSize
            }, resourceInfo.resourceType).then(results => model.systemProperties = results);
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
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceVersionService.prototype, "resourceFilePropertyGenerator", void 0);
    ResourceVersionService = __decorate([
        midway_1.provide('resourceVersionService')
    ], ResourceVersionService);
    return ResourceVersionService;
})();
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLXZlcnNpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFDdkMsaUNBQWlDO0FBS2pDLHVEQUFpRTtBQUNqRSxtQ0FBK0U7QUFHL0U7SUFBQSxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtRQWEvQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFJO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFpQixFQUFFLEdBQUcsSUFBSTtZQUNwQyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFlBQTBCLEVBQUUsT0FBcUM7WUFFekYsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsTUFBTSxjQUFjLEdBQUcsZ0JBQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM5RCxNQUFNLEVBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFB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