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
        if (lodash_1.isArray(options.policies)) {
            const policyIdNameMap = await this._validateSubjectPolicies(options.policies).then(list => new Map(list.map(x => [x.policyId, x.policyName])));
            options.policies.forEach(addPolicy => resourceInfo.policies.push({
                policyId: addPolicy.policyId,
                policyName: addPolicy.policyName ?? policyIdNameMap.get(addPolicy.policyId),
                status: addPolicy.status ?? 1
            }));
        }
        resourceInfo.status = ResourceService_1._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
        resourceInfo.uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceInfo.resourceName);
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
        if (lodash_1.isArray(options.updatePolicies)) {
            options.updatePolicies.forEach(modifyPolicy => {
                const existingPolicy = existingPolicyMap.get(modifyPolicy.policyId);
                if (existingPolicy) {
                    existingPolicy.policyName = modifyPolicy.policyName ?? existingPolicy.policyName;
                    existingPolicy.status = modifyPolicy.status ?? existingPolicy.status;
                }
                // 如果选的策略无效,直接忽略.不做过多干扰
                // throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'policyId'), modifyPolicy);
            });
        }
        if (lodash_1.isArray(options.addPolicies)) {
            const policyIdNameMap = await this._validateSubjectPolicies(options.addPolicies).then(list => new Map(list.map(x => [x.policyId, x.policyName])));
            options.addPolicies.forEach(addPolicy => {
                if (existingPolicyMap.has(addPolicy.policyId)) {
                    throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('policy-create-duplicate-error'), addPolicy);
                }
                addPolicy.policyName = addPolicy.policyName ?? policyIdNameMap.get(addPolicy.policyId);
                addPolicy.status = addPolicy.status ?? 1;
                existingPolicyMap.set(addPolicy.policyId, addPolicy);
            });
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
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            version: versionInfo.version,
            versions: resourceInfo.resourceVersions.map(x => x['version']),
            resourceType: resourceInfo.resourceType,
            versionRange: versionInfo.version,
            versionId: versionInfo.versionId,
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
        const resourceInfo = { resourceVersions: [] }; //减少不必要的数据需求,自行构造一个
        const dependencyTree = await this.getResourceDependencyTree(resourceInfo, versionInfo, options);
        const recursionAuthTree = (dependencyTreeNode) => dependencyTreeNode.resolveResources.map(resolveResource => {
            const list = this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource);
            return {
                resourceId: resolveResource.resourceId,
                resourceName: resolveResource.resourceName,
                contracts: resolveResource.contracts,
                versions: lodash_1.uniqBy(list, 'versionId').map(item => Object({
                    version: item['version'],
                    versionId: item['versionId'],
                    resolveResources: recursionAuthTree(item)
                })),
                versionRanges: lodash_1.chain(list).map(x => x['versionRange']).uniq().value()
            };
        });
        return recursionAuthTree(lodash_1.first(dependencyTree));
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
    /**
     * 分页查找资源
     * @param {object} condition
     * @param {number} page
     * @param {number} pageSize
     * @param {string[]} projection
     * @param {object} orderBy
     * @returns {Promise<ResourceInfo[]>}
     */
    async findPageList(condition, page, pageSize, projection, orderBy) {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.resourceProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
        }
        return { page, pageSize, totalItem, dataList };
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
     * @param policyIds
     * @private
     */
    async _validateSubjectPolicies(policies) {
        if (lodash_1.isEmpty(policies)) {
            return [];
        }
        if (lodash_1.uniqBy(policies, 'policyId').length !== policies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }
        const policyInfos = await this.outsideApiService.getResourcePolicies(policies.map(x => x.policyId), ['policyId', 'policyName', 'userId']);
        const invalidPolicies = lodash_1.differenceBy(policies, policyInfos, 'policyId');
        if (!lodash_1.isEmpty(invalidPolicies)) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-validate-failed'), invalidPolicies);
        }
        return policyInfos;
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
        for (let i = 0, j = resourceList.length; i < j; i++) {
            const { resourceId, resourceVersions } = resourceList[i];
            const dependencyInfo = dependencyMap.get(resourceId);
            const { version, versionId } = this._getResourceMaxSatisfying(resourceVersions, dependencyInfo.versionRange);
            dependencyInfo.version = version;
            dependencyInfo.versionId = versionId;
            dependencyInfo.versions = resourceVersions.map(x => x.version);
            versionIds.push(dependencyInfo.versionId);
        }
        const versionInfoMap = await this.resourceVersionService.find({ versionId: { $in: versionIds } })
            .then(list => new Map(list.map(x => [x.versionId, x])));
        const results = [];
        const tasks = [];
        for (let i = 0, j = resourceList.length; i < j; i++) {
            const { resourceId, resourceName, resourceType, baseUpcastResources } = resourceList[i];
            const { versionId, versionRange, versions, version } = dependencyMap.get(resourceId);
            const versionInfo = versionInfoMap.get(versionId);
            let result = {
                resourceId, resourceName, versions, version, resourceType, versionRange, baseUpcastResources, versionId,
                resolveResources: versionInfo.resolveResources,
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
     * @param {any[]} dependencyTree
     * @returns {Promise<ResourceVersionInfo[]>}
     * @private
     */
    async _getAllVersionInfoFormDependencyTree(dependencyTree) {
        const resourceVersionIdSet = new Set();
        const recursion = (dependencies) => dependencies.forEach((item) => {
            resourceVersionIdSet.add(item.versionId);
            recursion(item.dependencies);
        });
        recursion(dependencyTree);
        if (!resourceVersionIdSet.size) {
            return [];
        }
        return this.resourceVersionService.find({ versionId: { $in: [...resourceVersionIdSet.values()] } });
    }
    /**
     * 从依赖树中获取指定的所有发行版本(查找多重上抛)
     * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
     * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
     * @param dependencies
     * @param resource
     * @param _list
     * @private
     */
    _findResourceVersionFromDependencyTree(dependencies, resource, _list = []) {
        return dependencies.reduce((acc, dependencyTreeNode) => {
            if (dependencyTreeNode.resourceId === resource.resourceId) {
                acc.push(dependencyTreeNode);
            }
            // 如果依赖项未上抛该发行,则终止检查子级节点
            if (!dependencyTreeNode.baseUpcastResources.some(x => x.resourceId === resource.resourceId)) {
                return acc;
            }
            return this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resource, acc);
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
     * @param {ResourceInfo} resourceInfo 资源信息
     * @returns {number} 资源状态
     * @private
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
], ResourceService.prototype, "resourcePolicyCompiler", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBcUM7QUFDckMsbUNBQXVDO0FBQ3ZDLHVEQUFrRDtBQUNsRCxtQ0FBK0c7QUFlL0csaUNBQWlDO0FBR2pDLElBQWEsZUFBZSx1QkFBNUIsTUFBYSxlQUFlO0lBZXhCOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQThCO1FBRS9DLE1BQU0sWUFBWSxHQUFpQjtZQUMvQixZQUFZLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDbkQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQ2xDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLG1CQUFtQixFQUFFLEVBQUU7WUFDdkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLFFBQVEsRUFBRSxFQUFFO1lBQ1osTUFBTSxFQUFFLENBQUM7U0FDWixDQUFDO1FBRUYsSUFBSSxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQixNQUFNLGVBQWUsR0FBd0IsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFD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