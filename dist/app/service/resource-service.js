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
    ctx;
    resourceProvider;
    resourceTagProvider;
    resourceFreezeRecordProvider;
    resourcePropertyGenerator;
    outsideApiService;
    resourceVersionService;
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
        if ((0, lodash_1.isArray)(options.policies) && !(0, lodash_1.isEmpty)(options.policies)) {
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
        if ((0, lodash_1.isArray)(options.coverImages)) {
            updateInfo.coverImages = options.coverImages;
        }
        if (!(0, lodash_1.isUndefined)(options.intro)) {
            updateInfo.intro = options.intro;
        }
        if ((0, lodash_1.isArray)(options.tags)) {
            updateInfo.tags = options.tags;
        }
        const existingPolicyMap = new Map(resourceInfo.policies.map(x => [x.policyId, x]));
        if ((0, lodash_1.isArray)(options.updatePolicies) && !(0, lodash_1.isEmpty)(options.updatePolicies)) {
            options.updatePolicies.forEach(modifyPolicy => {
                const existingPolicy = existingPolicyMap.get(modifyPolicy.policyId);
                if (existingPolicy) {
                    existingPolicy.status = modifyPolicy.status ?? existingPolicy.status;
                }
                // 如果选的策略无效,直接忽略.不做过多干扰
                // throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'policyId'), modifyPolicy);
            });
        }
        if ((0, lodash_1.isArray)(options.addPolicies) && !(0, lodash_1.isEmpty)(options.addPolicies)) {
            const existingPolicyNameSet = new Set(resourceInfo.policies.map(x => x.policyName));
            const duplicatePolicyNames = options.addPolicies.filter(x => existingPolicyNameSet.has(x.policyName));
            if (!(0, lodash_1.isEmpty)(duplicatePolicyNames)) {
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
        if ((0, lodash_1.isArray)(options.addPolicies) || (0, lodash_1.isArray)(options.updatePolicies)) {
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
        return [(0, lodash_1.omit)(rootTreeNode, options.omitFields)];
    }
    /**
     * 获取资源授权树
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    async getResourceAuthTree(versionInfo) {
        if ((0, lodash_1.isEmpty)(versionInfo.resolveResources ?? [])) {
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
        return recursionAuthTree((0, lodash_1.first)(dependencyTree)).filter(x => x.length);
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
        const resourceIds = (0, lodash_1.first)(dependencyTree).dependencies?.map(dependency => dependency.baseUpcastResources.map(x => x.resourceId)).flat();
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
                children: (0, lodash_1.first)(dependencyTree).dependencies?.map(dependency => {
                    return {
                        resourceId: dependency.resourceId,
                        resourceName: dependency.resourceName,
                        resourceType: dependency.resourceType,
                        versionRanges: [dependency.versionRange],
                        versions: [dependency.version],
                        versionIds: [dependency.versionId],
                        resolveResources: dependency.resolveResources,
                        children: dependency.baseUpcastResources.map(upcastResource => {
                            const resolveVersions = (0, lodash_1.uniqBy)(this.findResourceVersionFromDependencyTree(dependency.dependencies, upcastResource.resourceId), 'versionId');
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
     * 冻结或解封资源
     * @param resourceInfo
     * @param remark
     */
    async freezeOrDeArchiveResource(resourceInfo, remark) {
        // 已经冻结的就是做解封操作.反之亦然
        const operatorType = [2, 3].includes(resourceInfo.status) ? 2 : 1;
        const operatorRecordInfo = {
            operatorUserId: this.ctx.userId,
            operatorUserName: this.ctx.identityInfo.userInfo.username,
            type: operatorType, remark: remark ?? ''
        };
        // 如果是冻结操作,则修改状态为2或3.反之则修改为0或1
        const resourceStatus = operatorType === 1 ? (resourceInfo.status === 0 ? 2 : 3) : operatorType === 2 ? (resourceInfo.status === 2 ? 0 : 1) : -1;
        const session = await this.resourceProvider.model.startSession();
        await session.withTransaction(async () => {
            await this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, { status: resourceStatus }, { session });
            await this.resourceFreezeRecordProvider.findOneAndUpdate({ resourceId: resourceInfo.resourceId }, {
                $push: { records: operatorRecordInfo }
            }, { session }).then(model => {
                return model || this.resourceFreezeRecordProvider.create([{
                        resourceId: resourceInfo.resourceId,
                        resourceName: resourceInfo.resourceName,
                        records: [operatorRecordInfo]
                    }], { session });
            });
        }).catch(error => {
            throw error;
        }).finally(() => {
            session.endSession();
        });
        return true;
    }
    /**
     * 查找资源标签
     * @param condition
     * @param args
     */
    async findResourceTags(condition, ...args) {
        return this.resourceTagProvider.find(condition, ...args);
    }
    /**
     * 分页查找资源标签
     * @param condition
     * @param skip
     * @param limit
     * @param projection
     * @param sort
     */
    async findIntervalResourceTagList(condition, skip, limit, projection, sort) {
        return this.resourceTagProvider.findIntervalList(condition, skip, limit, projection?.toString(), sort);
    }
    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    async createdResourceVersionHandle(resourceInfo, versionInfo) {
        resourceInfo.resourceVersions.push((0, lodash_1.pick)(versionInfo, ['version', 'versionId', 'createDate']));
        const latestVersionInfo = resourceInfo.resourceVersions.sort((x, y) => semver.lt(x['version'], y['version']) ? 1 : -1).shift();
        const modifyModel = {
            $addToSet: { resourceVersions: versionInfo },
            latestVersion: latestVersionInfo.version,
            status: ResourceService_1._getResourceStatus([versionInfo], resourceInfo.policies)
        };
        if ((0, lodash_1.isEmpty)(resourceInfo.resourceVersions)) {
            modifyModel.baseUpcastResources = versionInfo.upcastResources;
        }
        return this.resourceProvider.updateOne({ _id: resourceInfo.resourceId }, modifyModel).then(data => Boolean(data.ok));
    }
    /**
     * 创建资源标签
     * @param model
     */
    async createResourceTag(model) {
        const tagInfo = await this.resourceTagProvider.findOne({ tagName: model.tagName });
        if (tagInfo) {
            throw new egg_freelog_base_1.ArgumentError('tag已经存在,不能重复创建');
        }
        return this.resourceTagProvider.create(model);
    }
    /**
     * 更新资源标签
     * @param tagList
     * @param model
     */
    async batchUpdateResourceTag(tagList, model) {
        return this.resourceTagProvider.updateMany({ _id: { $in: tagList.map(x => x.tagId) } }, model).then(t => Boolean(t.ok));
    }
    /**
     * 批量设置或移除标签
     * @param resourceIds 资源对象
     * @param tags 操作的表
     * @param setType 1:设置 2:移除
     */
    async batchSetOrUnsetResourceTag(resourceIds, tags, setType) {
        const updateModel = {};
        if (setType === 1) {
            updateModel.$addToSet = { tags };
        }
        else {
            updateModel.$pull = { tags: { $in: tags } };
        }
        return this.resourceProvider.updateMany({ _id: { $in: resourceIds } }, updateModel).then(t => Boolean(t.ok));
    }
    /**
     * 过滤掉不可用的标签
     * @param resourceType
     * @param resourceTags
     */
    async filterResourceTag(resourceType, resourceTags) {
        const condition = {
            authority: 1,
            $or: [{ resourceRangeType: 3 },
                { resourceRangeType: 1, resourceRange: resourceType },
                {
                    resourceRangeType: 2,
                    resourceRange: { $ne: resourceType }
                }]
        };
        const usableTags = await this.findResourceTags(condition, 'tagName tagType');
        return (0, lodash_1.intersectionWith)(resourceTags, usableTags, (x, y) => x === y.tagName);
    }
    /**
     * 策略校验
     * @param policies
     */
    async _validateAndCreateSubjectPolicies(policies) {
        if ((0, lodash_1.isEmpty)(policies)) {
            return [];
        }
        // 名称不允许重复
        if ((0, lodash_1.uniqBy)(policies, 'policyName').length !== policies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }
        const policyInfos = await this.outsideApiService.createPolicies(policies.map(x => x.policyText));
        if (policyInfos.length !== policies.length) {
            throw new egg_freelog_base_1.ApplicationError(this.ctx.gettext('subject-policy-create-failed'));
        }
        if ((0, lodash_1.uniqBy)(policyInfos, 'policyId').length !== policyInfos.length) {
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
        if ((0, lodash_1.isEmpty)(dependencies ?? []) || currDeep++ > maxDeep) {
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
            if (!(0, lodash_1.isEmpty)(omitFields)) {
                result = (0, lodash_1.omit)(result, omitFields);
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
        const version = (0, semver_1.maxSatisfying)(resourceVersions.map(x => x.version), versionRange);
        return resourceVersions.find(x => x.version === version);
    }
    /**
     * 给资源填充最新版本详情信息
     * @param resources
     */
    async fillResourceLatestVersionInfo(resources) {
        if (!(0, lodash_1.isArray)(resources) || (0, lodash_1.isEmpty)(resources)) {
            return resources;
        }
        const versionIds = resources.filter(x => (0, lodash_1.isString)(x?.latestVersion) && x.latestVersion.length).map(resourceInfo => {
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
            resourceInfo['latestVersionId'] = versionId;
            return versionId;
        });
        if ((0, lodash_1.isEmpty)(versionIds)) {
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
     * @param isTranslate
     */
    async fillResourcePolicyInfo(resources, isTranslate) {
        if (!(0, lodash_1.isArray)(resources) || (0, lodash_1.isEmpty)(resources)) {
            return resources;
        }
        const policyIds = (0, lodash_1.chain)(resources).filter(x => (0, lodash_1.isArray)(x?.policies) && !(0, lodash_1.isEmpty)(x.policies)).map(x => x.policies.map(m => m.policyId)).flatten().uniq().value();
        if ((0, lodash_1.isEmpty)(policyIds)) {
            return resources;
        }
        const policyMap = await this.outsideApiService.getResourcePolicies(policyIds, ['policyId', 'policyText', 'fsmDescriptionInfo'], isTranslate).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        return resources.map((item) => {
            const resourceInfo = item.toObject ? item.toObject() : item;
            resourceInfo.policies.forEach(policyInfo => {
                const { policyText, fsmDescriptionInfo, translateInfo } = policyMap.get(policyInfo.policyId) ?? {};
                policyInfo.policyText = policyText;
                policyInfo.fsmDescriptionInfo = fsmDescriptionInfo;
                policyInfo.translateInfo = translateInfo;
            });
            return resourceInfo;
        });
    }
    /**
     * 统计资源标签数量
     * @param tags
     */
    async tagStatistics(tags) {
        const condition = [
            { $match: { tags: { $in: tags } } },
            { $unwind: { path: '$tags' } },
            { $match: { tags: { $in: tags } } },
            { $group: { _id: '$tags', count: { '$sum': 1 } } },
            { $project: { tag: `$_id`, _id: 0, count: '$count' } },
        ];
        return this.resourceProvider.aggregate(condition);
    }
    /**
     * 获取资源状态
     * 1: 必须具备有效的策略
     * 2: 必须包含一个有效的版本
     * @param resourceVersions
     * @param policies
     */
    static _getResourceStatus(resourceVersions, policies) {
        return (policies.some(x => x.status === 1) && !(0, lodash_1.isEmpty)(resourceVersions)) ? 1 : 0;
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceTagProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceFreezeRecordProvider", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourcePropertyGenerator", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "outsideApiService", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceService.prototype, "resourceVersionService", void 0);
ResourceService = ResourceService_1 = __decorate([
    (0, midway_1.provide)('resourceService')
], ResourceService);
exports.ResourceService = ResourceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBcUM7QUFDckMsbUNBQXVDO0FBQ3ZDLHVEQUFnSDtBQUNoSCxtQ0FBbUg7QUFtQm5ILGlDQUFpQztBQUdqQyxJQUFhLGVBQWUsdUJBQTVCLE1BQWEsZUFBZTtJQUd4QixHQUFHLENBQWlCO0lBRXBCLGdCQUFnQixDQUFrQztJQUVsRCxtQkFBbUIsQ0FBcUM7SUFFeEQsNEJBQTRCLENBQXlCO0lBRXJELHlCQUF5QixDQUFDO0lBRTFCLGlCQUFpQixDQUFxQjtJQUV0QyxzQkFBc0IsQ0FBMEI7SUFFaEQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBOEI7UUFFL0MsTUFBTSxZQUFZLEdBQWlCO1lBQy9CLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtZQUNuRCxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7WUFDbEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLGdCQUFnQixFQUFFLEVBQUU7WUFDcEIsbUJBQW1CLEVBQUUsRUFBRTtZQUN2QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFFLEVBQUU7WUFDWixNQUFNLEVBQUUsQ0FBQztTQUNaLENBQUM7UUFFRixJQUFJLElBQUEsZ0JBQU8sRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLGdCQUFPLEVBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3pELFlBQVks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