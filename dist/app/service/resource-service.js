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
        resourceInfo.status = ResourceService_1._getResourceStatus(resourceInfo, resourceInfo.resourceVersions, resourceInfo.policies);
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
            updateInfo.status = ResourceService_1._getResourceStatus(resourceInfo, resourceInfo.resourceVersions, resourceInfo.policies);
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
     * 批量冻结资源
     * @param resourceIds
     * @param operationType
     * @param reason
     * @param remark
     */
    async batchFreeOrRecoverResource(resourceIds, operationType, reason, remark) {
        const session = await this.resourceProvider.model.startSession();
        await this.resourceProvider.updateMany({ _id: resourceIds }, {
            $bit: { status: operationType === 1 ? { or: 2 } : { xor: 2 } }
        }, { session });
        const operatorRecordInfo = {
            operatorUserId: this.ctx.userId,
            operatorUserName: this.ctx.identityInfo.userInfo.username,
            type: operationType, remark: remark ?? '', reason: reason ?? ''
        };
        const existingRecordResourceIds = await this.resourceFreezeRecordProvider.find({ resourceId: { $in: resourceIds } }, 'resourceId').then(list => {
            return list.map(x => x.resourceId);
        });
        if (existingRecordResourceIds.length) {
            await this.resourceFreezeRecordProvider.updateMany({ resourceId: { $in: existingRecordResourceIds } }, {
                $push: { records: operatorRecordInfo }
            }, { session });
        }
        const inexistenceRecordResourceIds = (0, lodash_1.difference)(resourceIds, existingRecordResourceIds);
        if (inexistenceRecordResourceIds.length) {
            const inexistenceRecordResources = await this.resourceProvider.find({ _id: { $in: inexistenceRecordResourceIds } }, 'resourceName');
            await this.resourceFreezeRecordProvider.insertMany(inexistenceRecordResources.map(resourceInfo => {
                return {
                    resourceId: resourceInfo.resourceId,
                    resourceName: resourceInfo.resourceName,
                    records: [operatorRecordInfo]
                };
            }), { session });
        }
        return true;
    }
    /**
     * 查询冻结与解冻记录
     * @param resourceIds
     * @param operationType
     * @param recordDesc
     * @param recordLimit
     */
    async batchFindFreeOrRecoverRecords(resourceIds, operationType, recordDesc, recordLimit) {
        const condition = { resourceId: { $in: resourceIds } };
        if (operationType) {
            condition['records.type'] = operationType;
        }
        return this.resourceFreezeRecordProvider.find(condition, { records: { $slice: [recordDesc ? 1 : 0, recordLimit ?? 10] } });
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
            status: ResourceService_1._getResourceStatus(resourceInfo, [versionInfo], resourceInfo.policies)
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
    static _getResourceStatus(resourceInfo, resourceVersions, policies) {
        const status = (policies.some(x => x.status === 1) && !(0, lodash_1.isEmpty)(resourceVersions)) ? 1 : 0;
        if ([2, 3].includes(resourceInfo.status) && status === 1) { // 冻结并上架
            return 3;
        }
        else if ([2, 3].includes(resourceInfo.status) && status === 0) { // 冻结并下架
            return 2;
        }
        else {
            return status;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBcUM7QUFDckMsbUNBQXVDO0FBQ3ZDLHVEQUFnSDtBQUNoSCxtQ0FZZ0I7QUFtQmhCLGlDQUFpQztBQUdqQyxJQUFhLGVBQWUsdUJBQTVCLE1BQWEsZUFBZTtJQUd4QixHQUFHLENBQWlCO0lBRXBCLGdCQUFnQixDQUFrQztJQUVsRCxtQkFBbUIsQ0FBcUM7SUFFeEQsNEJBQTRCLENBQXlCO0lBRXJELHlCQUF5QixDQUFDO0lBRTFCLGlCQUFpQixDQUFxQjtJQUV0QyxzQkFBc0IsQ0FBMEI7SUFFaEQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBOEI7UUFFL0MsTUFBTSxZQUFZLEdBQWlCO1lBQy9CLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtZQUNuRCxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7WUFDbEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLGdCQUFnQixFQUFFLEVBQUU7WUFDcEIsbUJBQW1CLEVBQUUsRUFBRTtZQUN2QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFFLEVBQUU7WUFDWixNQUFNLEVBQUUsQ0FBQztTQUNaLENBQUM7UUFFRixJQUFJLElBQUEsZ0JBQU8sRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLGdCQUFPLEVBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3pELFlBQVks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