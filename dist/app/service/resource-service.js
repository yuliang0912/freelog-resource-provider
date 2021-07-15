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
var ResourceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
const semver_1 = require("semver");
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
const lodash_1 = require("lodash");
const semver = require("semver");
let ResourceService = ResourceService_1 = class ResourceService {
    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    async createResource(options) {
        const resourceInfo = {
            resourceName: `${options.username}/${options.name}`,
            resourceType: options.resourceType,
            userId: options.userId,
            username: options.username,
            intro: options.intro,
            coverImages: options.coverImages,
            resourceVersions: [],
            baseUpcastResources: [],
            tags: options.tags,
            policies: [],
            status: 0
        };
        if (lodash_1.isArray(options.policies) && !lodash_1.isEmpty(options.policies)) {
            resourceInfo.policies = await this._validateAndCreateSubjectPolicies(options.policies);
        }
        resourceInfo.status = ResourceService_1._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
        resourceInfo.uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceInfo.resourceName);
        resourceInfo.resourceNameAbbreviation = options.name;
        return this.resourceProvider.create(resourceInfo);
    }
    /**
     * 更新资源
     * @param resourceInfo
     * @param options
     */
    async updateResource(resourceInfo, options) {
        const updateInfo = {};
        if (lodash_1.isArray(options.coverImages)) {
            updateInfo.coverImages = options.coverImages;
        }
        if (!lodash_1.isUndefined(options.intro)) {
            updateInfo.intro = options.intro;
        }
        if (lodash_1.isArray(options.tags)) {
            updateInfo.tags = options.tags;
        }
        const existingPolicyMap = new Map(resourceInfo.policies.map(x => [x.policyId, x]));
        if (lodash_1.isArray(options.updatePolicies) && !lodash_1.isEmpty(options.updatePolicies)) {
            options.updatePolicies.forEach(modifyPolicy => {
                const existingPolicy = existingPolicyMap.get(modifyPolicy.policyId);
                if (existingPolicy) {
                    existingPolicy.status = modifyPolicy.status ?? existingPolicy.status;
                }
                // 如果选的策略无效,直接忽略.不做过多干扰
                // throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'policyId'), modifyPolicy);
            });
        }
        if (lodash_1.isArray(options.addPolicies) && !lodash_1.isEmpty(options.addPolicies)) {
            const existingPolicyNameSet = new Set(resourceInfo.policies.map(x => x.policyName));
            const duplicatePolicyNames = options.addPolicies.filter(x => existingPolicyNameSet.has(x.policyName));
            if (!lodash_1.isEmpty(duplicatePolicyNames)) {
                throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-name-duplicate-failed'), duplicatePolicyNames);
            }
            const createdPolicyList = await this._validateAndCreateSubjectPolicies(options.addPolicies);
            for (const createdPolicy of createdPolicyList) {
                if (existingPolicyMap.has(createdPolicy.policyId)) {
                    throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('policy-create-duplicate-error'), createdPolicy);
                }
                existingPolicyMap.set(createdPolicy.policyId, createdPolicy);
            }
        }
        if (lodash_1.isArray(options.addPolicies) || lodash_1.isArray(options.updatePolicies)) {
            resourceInfo.policies = updateInfo.policies = [...existingPolicyMap.values()];
            updateInfo.status = ResourceService_1._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
        }
        return this.resourceProvider.findOneAndUpdate({ _id: options.resourceId }, updateInfo, { new: true });
    }
    /**
     * 获取资源依赖树
     * @param resourceInfo
     * @param versionInfo
     * @param options
     */
    async getResourceDependencyTree(resourceInfo, versionInfo, options) {
        if (!options.isContainRootNode) {
            return this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields);
        }
        const rootTreeNode = {
            resourceId: versionInfo.resourceId,
            resourceName: versionInfo.resourceName,
            version: versionInfo.version,
            versions: resourceInfo.resourceVersions?.map(x => x['version']),
            resourceType: versionInfo.resourceType,
            versionRange: versionInfo.version,
            versionId: versionInfo.versionId,
            fileSha1: versionInfo.fileSha1,
            baseUpcastResources: resourceInfo.baseUpcastResources,
            resolveResources: versionInfo.resolveResources,
            dependencies: await this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields)
        };
        return [lodash_1.omit(rootTreeNode, options.omitFields)];
    }
    /**
     * 获取资源授权树
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    async getResourceAuthTree(versionInfo) {
        if (lodash_1.isEmpty(versionInfo.resolveResources ?? [])) {
            return [];
        }
        const options = { maxDeep: 999, omitFields: [], isContainRootNode: true };
        const dependencyTree = await this.getResourceDependencyTree({}, versionInfo, options);
        return this.getResourceAuthTreeFromDependencyTree(dependencyTree);
    }
    /**
     * 依赖树转换成授权树
     * @param dependencyTree
     */
    getResourceAuthTreeFromDependencyTree(dependencyTree) {
        const recursionAuthTree = (dependencyTreeNode) => dependencyTreeNode.resolveResources.map(resolveResource => {
            return this.findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource.resourceId).map(x => {
                return {
                    resourceId: resolveResource.resourceId,
                    resourceName: resolveResource.resourceName,
                    resourceType: x.resourceType,
                    versionId: x.versionId,
                    version: x.version,
                    versionRange: x.versionRange,
                    fileSha1: x.fileSha1,
                    contracts: resolveResource.contracts,
                    children: recursionAuthTree(x)
                };
            });
        });
        return recursionAuthTree(lodash_1.first(dependencyTree)).filter(x => x.length);
    }
    /**
     * 获取关系树(资源=>资源的依赖=>依赖的上抛,最多三层)
     * @param versionInfo
     * @param dependencyTree
     */
    async getRelationTree(versionInfo, dependencyTree) {
        if (!dependencyTree) {
            dependencyTree = await this.getResourceDependencyTree({}, versionInfo, { isContainRootNode: true });
        }
        const resourceTypeMap = new Map();
        const resourceIds = lodash_1.first(dependencyTree).dependencies?.map(dependency => dependency.baseUpcastResources.map(x => x.resourceId)).flat();
        if (resourceIds.length) {
            await this.resourceProvider.find({ _id: { $in: resourceIds } }, '_id resourceType').then(list => {
                list.forEach(x => resourceTypeMap.set(x.resourceId, x.resourceType));
            });
        }
        return [{
                resourceId: versionInfo.resourceId,
                resourceName: versionInfo.resourceName,
                resourceType: versionInfo.resourceType,
                versionRanges: [],
                versions: [versionInfo.version],
                versionIds: [versionInfo.versionId],
                resolveResources: versionInfo.resolveResources,
                children: lodash_1.first(dependencyTree).dependencies?.map(dependency => {
                    return {
                        resourceId: dependency.resourceId,
                        resourceName: dependency.resourceName,
                        resourceType: dependency.resourceType,
                        versionRanges: [dependency.versionRange],
                        versions: [dependency.version],
                        versionIds: [dependency.versionId],
                        resolveResources: dependency.resolveResources,
                        children: dependency.baseUpcastResources.map(upcastResource => {
                            const resolveVersions = lodash_1.uniqBy(this.findResourceVersionFromDependencyTree(dependency.dependencies, upcastResource.resourceId), 'versionId');
                            return {
                                resourceId: upcastResource.resourceId,
                                resourceName: upcastResource.resourceName,
                                resourceType: resourceTypeMap.get(upcastResource.resourceId),
                                versionRanges: resolveVersions.map(x => x.versionRange),
                                versions: resolveVersions.map(x => x.version),
                                versionIds: resolveVersions.map(x => x.versionId),
                                children: []
                            };
                        })
                    };
                })
            }];
    }
    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames 资源名称集
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    async findByResourceNames(resourceNames, ...args) {
        const uniqueKeys = resourceNames.map(x => this.resourcePropertyGenerator.generateResourceUniqueKey(x));
        return this.resourceProvider.find({ uniqueKey: { $in: uniqueKeys } }, ...args);
    }
    /**
     * 根据资源ID获取资源信息
     * @param resourceId
     * @param args
     */
    async findByResourceId(resourceId, ...args) {
        return this.resourceProvider.findById(resourceId, ...args);
    }
    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    async findOneByResourceName(resourceName, ...args) {
        const uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceName);
        return this.resourceProvider.findOne({ uniqueKey }, ...args);
    }
    async findUserCreatedResourceCounts(userIds) {
        return this.resourceProvider.aggregate([
            {
                $match: { userId: { $in: userIds } }
            },
            {
                $group: { _id: '$userId', count: { '$sum': 1 } }
            },
            {
                $project: { _id: 0, userId: '$_id', count: '$count' }
            }
        ]);
    }
    /**
     * 根据条件查找单个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    async findOne(condition, ...args) {
        return this.resourceProvider.findOne(condition, ...args);
    }
    /**
     * 根据条件查询多个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    async find(condition, ...args) {
        return this.resourceProvider.find(condition, ...args);
    }
    async findIntervalList(condition, skip, limit, projection, sort) {
        return this.resourceProvider.findIntervalList(condition, skip, limit, projection?.toString(), sort);
    }
    /**
     * 按条件统计资源数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    async count(condition) {
        return this.resourceProvider.count(condition);
    }
    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    async createdResourceVersionHandle(resourceInfo, versionInfo) {
        resourceInfo.resourceVersions.push(lodash_1.pick(versionInfo, ['version', 'versionId', 'createDate']));
        const latestVersionInfo = resourceInfo.resourceVersions.sort((x, y) => semver.lt(x['version'], y['version']) ? 1 : -1).shift();
        const modifyModel = {
            $addToSet: { resourceVersions: versionInfo },
            latestVersion: latestVersionInfo.version,
            status: ResourceService_1._getResourceStatus([versionInfo], resourceInfo.policies)
        };
        if (lodash_1.isEmpty(resourceInfo.resourceVersions)) {
            modifyModel.baseUpcastResources = versionInfo.upcastResources;
        }
        return this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, modifyModel).then(data => Boolean(data.ok));
    }
    /**
     * 策略校验
     * @param policies
     */
    async _validateAndCreateSubjectPolicies(policies) {
        if (lodash_1.isEmpty(policies)) {
            return [];
        }
        // 名称不允许重复
        if (lodash_1.uniqBy(policies, 'policyName').length !== policies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }
        const policyInfos = await this.outsideApiService.createPolicies(policies.map(x => x.policyText));
        if (policyInfos.length !== policies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-create-failed'));
        }
        if (lodash_1.uniqBy(policyInfos, 'policyId').length !== policyInfos.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }
        const result = [];
        for (let i = 0, j = policyInfos.length; i < j; i++) {
            const policyInfo = policyInfos[i];
            result.push({
                policyId: policyInfo.policyId,
                policyText: policyInfo.policyText,
                fsmDescriptionInfo: policyInfo.fsmDescriptionInfo,
                policyName: policies[i].policyName,
                status: policies[i].status ?? 1,
            });
        }
        return result;
    }
    /**
     * 构建依赖树
     * @param dependencies
     * @param {number} maxDeep
     * @param {number} currDeep
     * @param {any[]} omitFields
     * @returns {Promise<any>}
     * @private
     */
    async _buildDependencyTree(dependencies, maxDeep = 100, currDeep = 1, omitFields = []) {
        if (lodash_1.isEmpty(dependencies ?? []) || currDeep++ > maxDeep) {
            return [];
        }
        const dependencyMap = new Map(dependencies.map(item => [item.resourceId, { versionRange: item.versionRange }]));
        const resourceList = await this.resourceProvider.find({ _id: { $in: Array.from(dependencyMap.keys()) } });
        const versionIds = [];
        for (const { resourceId, resourceVersions } of resourceList) {
            const dependencyInfo = dependencyMap.get(resourceId);
            const { version, versionId } = this._getResourceMaxSatisfying(resourceVersions, dependencyInfo.versionRange);
            dependencyInfo.version = version;
            dependencyInfo.versionId = versionId;
            dependencyInfo.versions = resourceVersions.map(x => x.version);
            versionIds.push(dependencyInfo.versionId);
        }
        const versionInfoMap = await this.resourceVersionService.find({ versionId: { $in: versionIds } })
            .then(list => new Map(list.map(x => [x.versionId, x])));
        const tasks = [];
        const results = [];
        for (const { resourceId, resourceName, resourceType, baseUpcastResources } of resourceList) {
            const { versionId, versionRange, versions, version } = dependencyMap.get(resourceId);
            const versionInfo = versionInfoMap.get(versionId);
            let result = {
                resourceId, resourceName, versions, version, resourceType, versionRange, baseUpcastResources, versionId,
                fileSha1: versionInfo.fileSha1, resolveResources: versionInfo.resolveResources,
                dependencies: []
            };
            if (!lodash_1.isEmpty(omitFields)) {
                result = lodash_1.omit(result, omitFields);
            }
            tasks.push(this._buildDependencyTree(versionInfo.dependencies || [], maxDeep, currDeep, omitFields)
                .then(list => result.dependencies = list));
            results.push(result);
        }
        return Promise.all(tasks).then(() => results);
    }
    /**
     * 从依赖树中获取所有相关的版本信息
     * @param dependencyTree
     */
    // async _getAllVersionInfoFormDependencyTree(dependencyTree: any[]): Promise<ResourceVersionInfo[]> {
    //
    //     const resourceVersionIdSet = new Set();
    //     const recursion = (dependencies) => dependencies.forEach((item) => {
    //         resourceVersionIdSet.add(item.versionId);
    //         recursion(item.dependencies);
    //     });
    //     recursion(dependencyTree);
    //
    //     if (!resourceVersionIdSet.size) {
    //         return [];
    //     }
    //     return this.resourceVersionService.find({versionId: {$in: [...resourceVersionIdSet.values()]}});
    // }
    /**
     * 从依赖树中获取指定的所有发行版本(查找多重上抛)
     * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
     * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
     * @param dependencies
     * @param resourceId
     * @param _list
     */
    findResourceVersionFromDependencyTree(dependencies, resourceId, _list = []) {
        return dependencies.reduce((acc, dependencyTreeNode) => {
            if (dependencyTreeNode.resourceId === resourceId) {
                acc.push(dependencyTreeNode);
            }
            // 如果依赖项未上抛该发行,则终止检查子级节点
            if (!dependencyTreeNode.baseUpcastResources.some(x => x.resourceId === resourceId)) {
                return acc;
            }
            return this.findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resourceId, acc);
        }, _list);
    }
    /**
     * 获取最匹配的semver版本
     * @param resourceVersions
     * @param versionRange
     * @returns {any}
     * @private
     */
    _getResourceMaxSatisfying(resourceVersions, versionRange) {
        const version = semver_1.maxSatisfying(resourceVersions.map(x => x.version), versionRange);
        return resourceVersions.find(x => x.version === version);
    }
    /**
     * 给资源填充最新版本详情信息
     * @param resources
     */
    async fillResourceLatestVersionInfo(resources) {
        if (!lodash_1.isArray(resources) || lodash_1.isEmpty(resources)) {
            return resources;
        }
        const versionIds = resources.filter(x => lodash_1.isString(x?.latestVersion) && x.latestVersion.length).map(resourceInfo => {
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
            resourceInfo['latestVersionId'] = versionId;
            return versionId;
        });
        if (lodash_1.isEmpty(versionIds)) {
            return resources;
        }
        const versionInfoMap = await this.resourceVersionService.find({ versionId: { $in: versionIds } }).then(list => {
            return new Map(list.map(x => [x.versionId, x]));
        });
        return resources.map((item) => {
            const resourceLatestVersionId = item.latestVersionId;
            const resourceInfo = item.toObject ? item.toObject() : item;
            resourceInfo.latestVersionInfo = versionInfoMap.get(resourceLatestVersionId) ?? {};
            return resourceInfo;
        });
    }
    /**
     * 给资源填充策略详情信息
     * @param resources
     */
    async fillResourcePolicyInfo(resources) {
        if (!lodash_1.isArray(resources) || lodash_1.isEmpty(resources)) {
            return resources;
        }
        const policyIds = lodash_1.chain(resources).filter(x => lodash_1.isArray(x?.policies) && !lodash_1.isEmpty(x.policies)).map(x => x.policies.map(m => m.policyId)).flatten().uniq().value();
        if (lodash_1.isEmpty(policyIds)) {
            return resources;
        }
        const policyMap = await this.outsideApiService.getResourcePolicies(policyIds, ['policyId', 'policyText', 'fsmDescriptionInfo']).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        return resources.map((item) => {
            const resourceInfo = item.toObject ? item.toObject() : item;
            resourceInfo.policies.forEach(policyInfo => {
                const { policyText, fsmDescriptionInfo } = policyMap.get(policyInfo.policyId) ?? {};
                policyInfo.policyText = policyText;
                policyInfo.fsmDescriptionInfo = fsmDescriptionInfo;
            });
            return resourceInfo;
        });
    }
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param resourceVersions
     * @param policies
     */
    static _getResourceStatus(resourceVersions, policies) {
        return (policies.some(x => x.status === 1) && !lodash_1.isEmpty(resourceVersions)) ? 1 : 0;
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceService.prototype, "ctx", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceProvider", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourcePropertyGenerator", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceService.prototype, "outsideApiService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceVersionService", void 0);
ResourceService = ResourceService_1 = __decorate([
    midway_1.provide('resourceService')
], ResourceService);
exports.ResourceService = ResourceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBcUM7QUFDckMsbUNBQXVDO0FBQ3ZDLHVEQUFpRztBQUNqRyxtQ0FBaUc7QUFrQmpHLGlDQUFpQztBQUdqQyxJQUFhLGVBQWUsdUJBQTVCLE1BQWEsZUFBZTtJQWF4Qjs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUE4QjtRQUUvQyxNQUFNLFlBQVksR0FBaUI7WUFDL0IsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ25ELFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtZQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixtQkFBbUIsRUFBRSxFQUFFO1lBQ3ZCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixRQUFRLEVBQUUsRUFBRTtZQUNaLE1BQU0sRUFBRSxDQUFDO1NBQ1osQ0FBQztRQUVGLElBQUksZ0JBQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN6RCxZQUFZLENBQUMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMxRjtRQUVELFlBQVksQ0FBQyxNQUFNLEdBQUcsaUJBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVB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