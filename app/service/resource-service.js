'use strict'

const Service = require('egg').Service
const sendToWormhole = require('stream-wormhole')

class ResourceService extends Service {

    /**
     * 创建资源
     * @param resourceName
     * @param resourceType
     * @param parentId
     * @param meta
     * @param fileStream
     * @returns {Promise<void>}
     */
    async createResource({resourceName, resourceType, parentId, meta, fileStream}) {

        let {ctx, app} = this
        let fileName = ctx.helper.uuid.v4().replace(/-/g, '')

        let dependencyCheck = ctx.helper.resourceDependencyCheck({dependencies: meta.dependencies})
        let fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType, meta, userId: ctx.request.userId})
        let fileUploadAsync = app.upload.putStream(`resources/${resourceType}/${fileName}`.toLowerCase(), fileStream)

        const resourceInfo = await Promise.all([fileCheckAsync, fileUploadAsync, dependencyCheck]).then(([metaInfo, uploadData, dependencies]) => new Object({
            resourceId: metaInfo.systemMeta.sha1,
            status: app.resourceStatus.NORMAL,
            resourceType,
            meta: JSON.stringify(meta),
            systemMeta: JSON.stringify(Object.assign(metaInfo.systemMeta, dependencies)),
            resourceUrl: uploadData.url,
            userId: ctx.request.userId,
            resourceName: resourceName === undefined ?
                ctx.helper.stringExpand.cutString(metaInfo.systemMeta.sha1, 10) :
                ctx.helper.stringExpand.cutString(resourceName, 80),
            mimeType: metaInfo.systemMeta.mimeType
        })).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        await ctx.dal.resourceProvider.getResourceInfo({resourceId: resourceInfo.resourceId}).then(resource => {
            resource && ctx.error({msg: '资源已经被创建,不能创建重复的资源', data: resourceInfo.resourceId})
        })

        await ctx.dal.resourceProvider.createResource(resourceInfo, parentId).bind(ctx)
            .then(() => {
                return ctx.dal.resourceTreeProvider.createResourceTree(ctx.request.userId, resourceInfo.resourceId, parentId)
            })
            .then(() => {
                resourceInfo.meta = JSON.parse(resourceInfo.meta)
                resourceInfo.systemMeta = JSON.parse(resourceInfo.systemMeta)
                ctx.success(resourceInfo)
            }).catch(ctx.error)

        if (resourceType === ctx.app.resourceType.WIDGET) {
            await ctx.dal.componentsProvider.create({
                widgetName: resourceInfo.systemMeta.widgetName,
                version: resourceInfo.systemMeta.version,
                resourceId: resourceInfo.resourceId,
                userId: resourceInfo.userId
            }).catch(console.error)
        }
    }

    /**
     * 更新资源
     * @param resourceId
     * @param model
     * @returns {Promise<void>}
     */
    async updateResource({resourceInfo, model}) {

        const {ctx} = this

        if (model.meta) {
            model.meta = JSON.stringify(model.meta)
        }
        if (model.meta && Array.isArray(model.meta.dependencies)
            && !this._dependenciesCompare(model.meta.dependencies, resourceInfo.systemMeta.dependencies)) {
            if (ctx.service.authSchemeService.isExistValidAuthScheme(resourceInfo.resourceId)) {
                ctx.error({msg: '当前资源已经存在发布的授权方案,必须全部废弃才能修改资源依赖'})
            }
            let dependencies = await ctx.helper.resourceDependencyCheck({
                dependencies: model.meta.dependencies,
                resourceId: resourceInfo.resourceId
            }).catch(err => ctx.error(err))
            model.systemMeta = JSON.stringify(Object.assign(resourceInfo.systemMeta, dependencies))
            model.status = 1 //资源更新依赖,则资源直接下架,需要重新发布授权方案才可以上线
        }

        return ctx.dal.resourceProvider.updateResourceInfo(model, {resourceId: resourceInfo.resourceId})
    }

    /**
     * 获取资源的依赖树
     * @param resourceId
     * @param deep
     * @returns {Promise<void>}
     */
    async getResourceDependencyTree(resourceId, deep = 0) {

        let {ctx} = this
        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            ctx.error({msg: '未找到有效资源'})
        }

        let dependencies = resourceInfo.systemMeta.dependencies || []

        return this.buildDependencyTree(dependencies).then(dependencies => new Object({
            resourceId: resourceInfo.resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            dependencies: dependencies
        }))
    }

    /**
     * 构建依赖树(后面可以对tree做同级合并,优化查询次数)
     * @param resourceIds
     * @returns {Promise<void>}
     * @private
     */
    async buildDependencyTree(dependencies, currDeep = 1, maxDeep = 0) {

        if (!dependencies.length || currDeep++ < maxDeep) {
            return []
        }
        let resourceIds = dependencies.map(item => item.resourceId)
        return this.ctx.dal.resourceProvider.getResourceByIdList(resourceIds).map(async item => new Object({
            resourceId: item.resourceId,
            resourceName: item.resourceName,
            resourceType: item.resourceType,
            dependencies: await this.buildDependencyTree(item.systemMeta.dependencies || [], currDeep, maxDeep)
        }))
    }


    /**
     * 更新资源状态
     * @param resourceId
     * @param status
     * @returns {Promise<*>}
     */
    async updateResourceStatus(resourceId, status) {
        return this.ctx.dal.resourceProvider.updateResourceInfo({status}, {resourceId}).then(data => data)
    }

    /**
     * 依赖比较
     * @param dependencies
     * @param targetDependencies
     * @private
     */
    _dependenciesCompare(metaDependencies, systemMetaDependencies) {
        const first = metaDependencies.sort().toString()
        const second = systemMetaDependencies.map(t => t.resourceId).sort().toString()
        return first === second
    }
}

module.exports = ResourceService

