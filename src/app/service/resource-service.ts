import {maxSatisfying} from 'semver';
import {provide, inject} from 'midway';
import {ApplicationError, FreelogContext, IMongodbOperation, PageResult} from "egg-freelog-base";
import {isArray, isUndefined, isString, omit, first, isEmpty, pick, uniqBy, chain} from 'lodash';
import {
    CreateResourceOptions,
    GetResourceDependencyOrAuthTreeOptions,
    IOutsideApiService,
    IResourceService,
    PolicyInfo,
    ResourceInfo,
    ResourceVersionInfo,
    UpdateResourceOptions,
    IResourceVersionService,
    ResourceAuthTree,
    BaseResourceVersion,
    ResourceDependencyTree,
    BaseResourceInfo,
    operationPolicyInfo,
    BasePolicyInfo
} from '../../interface';
import * as semver from 'semver';

@provide('resourceService')
export class ResourceService implements IResourceService {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceProvider: IMongodbOperation<ResourceInfo>;
    @inject()
    resourcePropertyGenerator;
    @inject()
    outsideApiService: IOutsideApiService;
    @inject()
    resourceVersionService: IResourceVersionService;

    /**
     * 创建资源
     * @param {CreateResourceOptions} options 资源选项
     * @returns {Promise<ResourceInfo>}
     */
    async createResource(options: CreateResourceOptions): Promise<ResourceInfo> {

        const resourceInfo: ResourceInfo = {
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

        if (isArray(options.policies) && !isEmpty(options.policies)) {
            resourceInfo.policies = await this._validateAndCreateSubjectPolicies(options.policies);
        }

        resourceInfo.status = ResourceService._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
        resourceInfo.uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceInfo.resourceName);

        return this.resourceProvider.create(resourceInfo);
    }

    /**
     * 更新资源
     * @param resourceInfo
     * @param options
     */
    async updateResource(resourceInfo: ResourceInfo, options: UpdateResourceOptions): Promise<ResourceInfo> {

        const updateInfo: any = {};
        if (isArray(options.coverImages)) {
            updateInfo.coverImages = options.coverImages;
        }
        if (!isUndefined(options.intro)) {
            updateInfo.intro = options.intro;
        }
        if (isArray(options.tags)) {
            updateInfo.tags = options.tags;
        }
        const existingPolicyMap = new Map<string, PolicyInfo>(resourceInfo.policies.map(x => [x.policyId, x]));
        if (isArray(options.updatePolicies) && !isEmpty(options.updatePolicies)) {
            options.updatePolicies.forEach(modifyPolicy => {
                const existingPolicy = existingPolicyMap.get(modifyPolicy.policyId);
                if (existingPolicy) {
                    existingPolicy.status = modifyPolicy.status ?? existingPolicy.status;
                }
                // 如果选的策略无效,直接忽略.不做过多干扰
                // throw new ApplicationError(this.ctx.gettext('params-validate-failed', 'policyId'), modifyPolicy);
            });
        }
        if (isArray(options.addPolicies) && !isEmpty(options.addPolicies)) {
            const existingPolicyNameSet = new Set(resourceInfo.policies.map(x => x.policyName));
            const duplicatePolicyNames = options.addPolicies.filter(x => existingPolicyNameSet.has(x.policyName));
            if (!isEmpty(duplicatePolicyNames)) {
                throw new ApplicationError(this.ctx.gettext('subject-policy-name-duplicate-failed'), duplicatePolicyNames);
            }
            const createdPolicyList = await this._validateAndCreateSubjectPolicies(options.addPolicies);
            for (const createdPolicy of createdPolicyList) {
                if (existingPolicyMap.has(createdPolicy.policyId)) {
                    throw new ApplicationError(this.ctx.gettext('policy-create-duplicate-error'), createdPolicy);
                }
                existingPolicyMap.set(createdPolicy.policyId, createdPolicy);
            }
        }
        if (isArray(options.addPolicies) || isArray(options.updatePolicies)) {
            resourceInfo.policies = updateInfo.policies = [...existingPolicyMap.values()];
            updateInfo.status = ResourceService._getResourceStatus(resourceInfo.resourceVersions, resourceInfo.policies);
        }
        return this.resourceProvider.findOneAndUpdate({_id: options.resourceId}, updateInfo, {new: true});
    }

    /**
     * 获取资源依赖树
     * @param resourceInfo
     * @param versionInfo
     * @param options
     */
    async getResourceDependencyTree(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo, options: GetResourceDependencyOrAuthTreeOptions): Promise<ResourceDependencyTree[]> {

        if (!options.isContainRootNode) {
            return this._buildDependencyTree(versionInfo.dependencies, options.maxDeep, 1, options.omitFields);
        }

        const rootTreeNode: ResourceDependencyTree = {
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

        return [omit(rootTreeNode, options.omitFields) as ResourceDependencyTree];
    }

    /**
     * 获取资源授权树
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<object[]>}
     */
    async getResourceAuthTree(versionInfo: ResourceVersionInfo): Promise<ResourceAuthTree[][]> {

        if (isEmpty(versionInfo.resolveResources ?? [])) {
            return [];
        }

        const options = {maxDeep: 999, omitFields: [], isContainRootNode: true};
        const dependencyTree = await this.getResourceDependencyTree({} as ResourceInfo, versionInfo, options);

        const recursionAuthTree = (dependencyTreeNode: ResourceDependencyTree) => dependencyTreeNode.resolveResources.map(resolveResource => {
            return this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource.resourceId).map(x => {
                return {
                    resourceId: resolveResource.resourceId,
                    resourceName: resolveResource.resourceName,
                    versionId: x.versionId,
                    version: x.version,
                    versionRange: x.versionRange,
                    fileSha1: x.fileSha1,
                    contracts: resolveResource.contracts,
                    children: recursionAuthTree(x)
                }
            });
        });

        return recursionAuthTree(first(dependencyTree));
    }

    /**
     * 获取关系树(资源=>资源的依赖=>依赖的上抛,最多三层)
     * @param versionInfo
     * @param dependencyTree
     */
    async getRelationTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<any[]> {

        if (!dependencyTree) {
            dependencyTree = await this.getResourceDependencyTree({} as ResourceInfo, versionInfo, {isContainRootNode: true});
        }
        return [{
            resourceId: versionInfo.resourceId,
            resourceName: versionInfo.resourceName,
            versions: [versionInfo.version],
            versionIds: [versionInfo.versionId],
            children: first(dependencyTree).dependencies?.map(dependency => {
                return {
                    resourceId: dependency.resourceId,
                    resourceName: dependency.resourceName,
                    versions: [dependency.version],
                    versionIds: [dependency.versionId],
                    children: dependency.baseUpcastResources.map(upcastResource => {
                        const resolveVersions = uniqBy(this._findResourceVersionFromDependencyTree(dependency.dependencies, upcastResource.resourceId), 'versionId');
                        return {
                            resourceId: upcastResource.resourceId,
                            resourceName: upcastResource.resourceName,
                            versions: resolveVersions.map(x => x.version),
                            versionIds: resolveVersions.map(x => x.versionId)
                        }
                    })
                }
            })
        }];
    }

    /**
     * 获取资源关系树
     * @param versionInfo
     */
    async getRelationAuthTree(versionInfo: ResourceVersionInfo, dependencyTree?: ResourceDependencyTree[]): Promise<ResourceAuthTree[][]> {

        const options = {maxDeep: 999, omitFields: [], isContainRootNode: true};
        const resourceInfo = {resourceVersions: []} as ResourceInfo; // 减少不必要的数据需求,自行构造一个
        if (!dependencyTree) {
            dependencyTree = await this.getResourceDependencyTree(resourceInfo, versionInfo, options);
        }
        const rootResource = first(dependencyTree);
        rootResource.baseUpcastResources = [];
        for (const upcastResource of versionInfo.upcastResources) {
            rootResource.resolveResources.push({
                resourceId: upcastResource.resourceId,
                resourceName: upcastResource.resourceName,
                contracts: null
            })
        }

        const recursionAuthTree = (dependencyTreeNode: ResourceDependencyTree): ResourceAuthTree[][] => dependencyTreeNode.resolveResources.map(resolveResource => {
            return this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resolveResource.resourceId).map(x => {
                return {
                    resourceId: resolveResource.resourceId,
                    resourceName: resolveResource.resourceName,
                    versionId: x.versionId,
                    version: x.version,
                    versionRange: x.versionRange,
                    contracts: resolveResource.contracts,
                    children: recursionAuthTree(x)
                };
            });
        });

        return recursionAuthTree(first(dependencyTree));
    }

    /**
     * 根据资源名批量获取资源
     * @param {string[]} resourceNames 资源名称集
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    async findByResourceNames(resourceNames: string[], ...args): Promise<ResourceInfo[]> {
        const uniqueKeys = resourceNames.map(x => this.resourcePropertyGenerator.generateResourceUniqueKey(x));
        return this.resourceProvider.find({uniqueKey: {$in: uniqueKeys}}, ...args);
    }

    /**
     * 根据资源ID获取资源信息
     * @param resourceId
     * @param args
     */
    async findByResourceId(resourceId: string, ...args): Promise<ResourceInfo> {
        return this.resourceProvider.findById(resourceId, ...args);
    }

    /**
     * 根据资源名获取资源
     * @param {string} resourceName
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    async findOneByResourceName(resourceName: string, ...args): Promise<ResourceInfo> {
        const uniqueKey = this.resourcePropertyGenerator.generateResourceUniqueKey(resourceName);
        return this.resourceProvider.findOne({uniqueKey}, ...args);
    }

    /**
     * 根据条件查找单个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo>}
     */
    async findOne(condition: object, ...args): Promise<ResourceInfo> {
        return this.resourceProvider.findOne(condition, ...args);
    }

    /**
     * 根据条件查询多个资源
     * @param {object} condition 查询条件
     * @param args
     * @returns {Promise<ResourceInfo[]>}
     */
    async find(condition: object, ...args): Promise<ResourceInfo[]> {
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
    async findPageList(condition: object, page: number, pageSize: number, projection: string[], orderBy: object): Promise<PageResult<ResourceInfo>> {
        let dataList = [];
        const totalItem = await this.count(condition);
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.resourceProvider.findPageList(condition, page, pageSize, projection.join(' '), orderBy);
        }
        return {page, pageSize, totalItem, dataList};
    }

    /**
     * 按条件统计资源数量
     * @param {object} condition
     * @returns {Promise<number>}
     */
    async count(condition: object): Promise<number> {
        return this.resourceProvider.count(condition);
    }

    /**
     * 创建资源版本事件处理
     * @param {ResourceInfo} resourceInfo
     * @param {ResourceVersionInfo} versionInfo
     * @returns {Promise<boolean>}
     */
    async createdResourceVersionHandle(resourceInfo: ResourceInfo, versionInfo: ResourceVersionInfo): Promise<boolean> {

        resourceInfo.resourceVersions.push(pick(versionInfo, ['version', 'versionId', 'createDate']) as BaseResourceVersion);
        const latestVersionInfo: any = resourceInfo.resourceVersions.sort((x, y) => semver.lt(x['version'], y['version']) ? 1 : -1).shift();

        const modifyModel: any = {
            $addToSet: {resourceVersions: versionInfo},
            latestVersion: latestVersionInfo.version,
            status: ResourceService._getResourceStatus([versionInfo], resourceInfo.policies)
        }
        if (isEmpty(resourceInfo.resourceVersions)) {
            modifyModel.baseUpcastResources = versionInfo.upcastResources;
        }

        return this.resourceProvider.updateOne({_id: resourceInfo.resourceId}, modifyModel).then(data => Boolean(data.ok));
    }

    /**
     * 策略校验
     * @param policyIds
     * @private
     */
    async _validateAndCreateSubjectPolicies(policies: operationPolicyInfo[]): Promise<PolicyInfo[]> {

        if (isEmpty(policies)) {
            return [];
        }
        // 名称不允许重复
        if (uniqBy(policies, 'policyName').length !== policies.length) {
            throw new ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }
        const policyInfos = await this.outsideApiService.createPolicies(policies.map(x => x.policyText));
        if (policyInfos.length !== policies.length) {
            throw new ApplicationError(this.ctx.gettext('subject-policy-create-failed'));
        }
        if (uniqBy(policyInfos, 'policyId').length !== policyInfos.length) {
            throw new ApplicationError(this.ctx.gettext('subject-policy-repeatability-validate-failed'));
        }

        const result: PolicyInfo[] = [];
        for (let i = 0, j = policyInfos.length; i < j; i++) {
            const policyInfo = policyInfos[i];
            result.push({
                policyId: policyInfo.policyId,
                policyText: policyInfo.policyText,
                fsmDescriptionInfo: policyInfo.fsmDescriptionInfo,
                policyName: policies[i].policyName,
                status: policies[i].status ?? 1,
            })
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
    async _buildDependencyTree(dependencies: BaseResourceInfo[], maxDeep: number = 100, currDeep: number = 1, omitFields: string[] = []): Promise<ResourceDependencyTree[]> {

        if (isEmpty(dependencies ?? []) || currDeep++ > maxDeep) {
            return [];
        }

        const dependencyMap: Map<string, any> = new Map(dependencies.map(item => [item.resourceId, {versionRange: item.versionRange}]));
        const resourceList: ResourceInfo[] = await this.resourceProvider.find({_id: {$in: Array.from(dependencyMap.keys())}});

        const versionIds = [];
        for (const {resourceId, resourceVersions} of resourceList) {
            const dependencyInfo = dependencyMap.get(resourceId);
            const {version, versionId} = this._getResourceMaxSatisfying(resourceVersions, dependencyInfo.versionRange);

            dependencyInfo.version = version;
            dependencyInfo.versionId = versionId;
            dependencyInfo.versions = resourceVersions.map(x => x.version);
            versionIds.push(dependencyInfo.versionId);
        }

        const versionInfoMap = await this.resourceVersionService.find({versionId: {$in: versionIds}})
            .then(list => new Map(list.map(x => [x.versionId, x])));

        const tasks = [];
        const results: ResourceDependencyTree[] = [];
        for (const {resourceId, resourceName, resourceType, baseUpcastResources} of resourceList) {
            const {versionId, versionRange, versions, version} = dependencyMap.get(resourceId);
            const versionInfo = versionInfoMap.get(versionId);
            let result: ResourceDependencyTree = {
                resourceId, resourceName, versions, version, resourceType, versionRange, baseUpcastResources, versionId,
                fileSha1: versionInfo.fileSha1, resolveResources: versionInfo.resolveResources,
                dependencies: []
            };
            if (!isEmpty(omitFields)) {
                result = omit(result, omitFields) as ResourceDependencyTree;
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
    async _getAllVersionInfoFormDependencyTree(dependencyTree: any[]): Promise<ResourceVersionInfo[]> {

        const resourceVersionIdSet = new Set();
        const recursion = (dependencies) => dependencies.forEach((item) => {
            resourceVersionIdSet.add(item.versionId);
            recursion(item.dependencies);
        });
        recursion(dependencyTree);

        if (!resourceVersionIdSet.size) {
            return [];
        }
        return this.resourceVersionService.find({versionId: {$in: [...resourceVersionIdSet.values()]}});
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
    _findResourceVersionFromDependencyTree(dependencies: ResourceDependencyTree[], resourceId: string, _list: ResourceDependencyTree[] = []): ResourceDependencyTree[] {
        return dependencies.reduce((acc, dependencyTreeNode) => {
            if (dependencyTreeNode.resourceId === resourceId) {
                acc.push(dependencyTreeNode);
            }
            // 如果依赖项未上抛该发行,则终止检查子级节点
            if (!dependencyTreeNode.baseUpcastResources.some(x => x.resourceId === resourceId)) {
                return acc;
            }
            return this._findResourceVersionFromDependencyTree(dependencyTreeNode.dependencies, resourceId, acc);
        }, _list);
    }

    /**
     * 获取最匹配的semver版本
     * @param resourceVersions
     * @param versionRange
     * @returns {any}
     * @private
     */
    _getResourceMaxSatisfying(resourceVersions: any[], versionRange: string): { version: string, versionId: string } {

        const version = maxSatisfying(resourceVersions.map(x => x.version), versionRange);

        return resourceVersions.find(x => x.version === version);
    }

    /**
     * 给资源填充最新版本详情信息
     * @param resources
     */
    async fillResourceLatestVersionInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]> {
        if (!isArray(resources) || isEmpty(resources)) {
            return resources;
        }

        const versionIds = resources.filter(x => isString(x?.latestVersion) && x.latestVersion.length).map(resourceInfo => {
            const versionId = this.resourcePropertyGenerator.generateResourceVersionId(resourceInfo.resourceId, resourceInfo.latestVersion);
            resourceInfo['latestVersionId'] = versionId;
            return versionId;
        });

        if (isEmpty(versionIds)) {
            return resources;
        }

        const versionInfoMap = await this.resourceVersionService.find({versionId: {$in: versionIds}}).then(list => {
            return new Map(list.map(x => [x.versionId, x]));
        })
        return resources.map((item: any) => {
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
    async fillResourcePolicyInfo(resources: ResourceInfo[]): Promise<ResourceInfo[]> {

        if (!isArray(resources) || isEmpty(resources)) {
            return resources;
        }
        const policyIds = chain(resources).filter(x => isArray(x?.policies) && !isEmpty(x.policies)).map(x => x.policies.map(m => m.policyId)).flatten().uniq().value();
        if (isEmpty(policyIds)) {
            return resources;
        }
        const policyMap: Map<string, BasePolicyInfo> = await this.outsideApiService.getResourcePolicies(policyIds, ['policyId', 'policyText', 'fsmDescriptionInfo']).then(list => {
            return new Map(list.map(x => [x.policyId, x]));
        });
        return resources.map((item: any) => {
            const resourceInfo = item.toObject ? item.toObject() : item;
            resourceInfo.policies.forEach(policyInfo => {
                const {policyText, fsmDescriptionInfo} = policyMap.get(policyInfo.policyId) ?? {};
                policyInfo.policyText = policyText;
                policyInfo.fsmDescriptionInfo = fsmDescriptionInfo;
            })
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
    static _getResourceStatus(resourceVersions: object[], policies: PolicyInfo[]): number {
        return (policies.some(x => x.status === 1) && !isEmpty(resourceVersions)) ? 1 : 0;
    }
}
