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
exports.ResourceService = void 0;
const semver_1 = require("semver");
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const semver = require("semver");
let ResourceService = /** @class */ (() => {
    var ResourceService_1;
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
                policies: options.policies,
                resourceVersions: [],
                baseUpcastResources: [],
                tags: options.tags,
                status: 0
            };
            resourceInfo.status = ResourceService_1._getResourceStatus(resourceInfo);
            resourceInfo.uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceInfo.resourceName);
            return this.resourceProvider.create(resourceInfo);
        }
        /**
         * 更新资源
         * @param {UpdateResourceOptions} options
         * @returns {Promise<ResourceInfo>}
         */
        async updateResource(options) {
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
            return this.resourceProvider.findOneAndUpdate({ _id: options.resourceId }, updateInfo, { new: true });
        }
        /**
         * 获取资源依赖树
         * @param {GetResourceDependencyOrAuthTreeOptions} options
         * @returns {Promise<object[]>}
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
                dependencies: await this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields)
            };
            return [lodash_1.omit(rootTreeNode, options.omitFields)];
        }
        /**
         * 获取资源授权树
         * @param {ResourceInfo} resourceInfo
         * @param {ResourceVersionInfo} versionInfo
         * @returns {Promise<object[]>}
         */
        async getResourceAuthTree(resourceInfo, versionInfo) {
            const options = { maxDeep: 100, omitFields: [], isContainRootNode: true };
            const dependencyTree = await this.getResourceDependencyTree(resourceInfo, versionInfo, options);
            const resourceVersionMap = await this._getAllVersionInfoFormDependencyTree(dependencyTree)
                .then(list => new Map(list.map(x => [x.versionId, x])));
            const recursionAuthTree = (dependencyTreeNode) => {
                const treeNodeVersionInfo = resourceVersionMap.get(dependencyTreeNode.versionId);
                return treeNodeVersionInfo.resolveResources.map(resolveResource => {
                    const list = this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource);
                    return {
                        resourceId: resolveResource['resourceId'],
                        resourceName: resolveResource['resourceName'],
                        contracts: resolveResource['contracts'],
                        versions: lodash_1.uniqBy(list, x => x['versionId']).map(item => Object({
                            version: item['version'],
                            resolveReleases: recursionAuthTree(item)
                        })),
                        versionRanges: lodash_1.chain(list).map(x => x['versionRange']).uniq().value()
                    };
                });
            };
            return recursionAuthTree(dependencyTree[0]);
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
         * @param {string} resourceId 资源ID
         * @returns {Promise<ResourceInfo>} 资源信息
         */
        async findByResourceId(resourceId) {
            return this.resourceProvider.findById(resourceId);
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
            return this.resourceProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
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
            resourceInfo.resourceVersions.push(versionInfo);
            const latestVersionInfo = resourceInfo.resourceVersions.sort((x, y) => semver.lt(x['version'], y['version']) ? 1 : -1).shift();
            return this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, {
                $addToSet: { resourceVersions: versionInfo },
                latestVersion: latestVersionInfo.version
            }).then(data => Boolean(data.ok));
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
            if (!dependencies.length || currDeep++ > maxDeep) {
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
            const versionInfoMap = await this.resourceVersionProvider.find({ versionId: { $in: versionIds } })
                .then(list => new Map(list.map(x => [x.versionId, x])));
            const results = [];
            const tasks = [];
            for (let i = 0, j = resourceList.length; i < j; i++) {
                const { resourceId, resourceName, resourceType, baseUpcastResources } = resourceList[i];
                const { versionId, versionRange, versions, version } = dependencyMap.get(resourceId);
                const versionInfo = versionInfoMap.get(versionId);
                let result = {
                    resourceId, resourceName, versions, version, resourceType, versionRange, baseUpcastResources, versionId
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
            return this.resourceVersionProvider.find({ versionId: { $in: [...resourceVersionIdSet.values()] } });
        }
        /**
         * 从依赖树中获取指定的所有发行版本(查找多重上抛)
         * 例如深度2的树节点上抛了A-1.0,深度3节点也上抛了A-1.1.
         * 然后由深度为1的节点解决了A.授权树需要找到1.0和1.1,然后分别计算所有分支
         * @param dependencies
         * @param resource
         * @returns {Array}
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
         * 获取资源状态
         * 1: 必须具备有效的策略
         * 2: 必须包含一个有效的版本
         * @param {ResourceInfo} resourceInfo 资源信息
         * @returns {number} 资源状态
         * @private
         */
        static _getResourceStatus(resourceInfo) {
            return resourceInfo.policies.some(x => x['status'] === 1) && !lodash_1.isEmpty(resourceInfo.resourceVersions) ? 1 : 0;
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
    ], ResourceService.prototype, "resourceVersionProvider", void 0);
    __decorate([
        midway_1.inject(),
        __metadata("design:type", Object)
    ], ResourceService.prototype, "resourcePropertyGenerator", void 0);
    ResourceService = ResourceService_1 = __decorate([
        midway_1.provide('resourceService')
    ], ResourceService);
    return ResourceService;
})();
exports.ResourceService = ResourceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUFxQztBQUNyQyxtQ0FBdUM7QUFDdkMsbUNBQTBFO0FBSzFFLGlDQUFpQztBQUdqQzs7SUFBQSxJQUFhLGVBQWUsdUJBQTVCLE1BQWEsZUFBZTtRQVd4Qjs7OztXQUlHO1FBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUE4QjtZQUUvQyxNQUFNLFlBQVksR0FBaUI7Z0JBQy9CLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDbkQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07Z0JBQ3RCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ2hDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsbUJBQW1CLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixNQUFNLEVBQUUsQ0FBQzthQUNaLENBQUM7WUFFRixZQUFZLENBQUMsTUFBTSxHQUFHLGlCQUFlLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkUsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTdHLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQ7Ozs7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