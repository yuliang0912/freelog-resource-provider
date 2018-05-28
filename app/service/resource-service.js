'use strict'

const uuid = require('uuid')
const lodash = require('lodash')
const moment = require('moment')
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
    async createResource({resourceName, resourceType, parentId, meta, description, previewImage, fileStream}) {

        let {ctx, app} = this
        let fileName = ctx.helper.uuid.v4().replace(/-/g, '')
        let userInfo = ctx.request.identityInfo.userInfo

        let dependencyCheck = ctx.helper.resourceDependencyCheck({dependencies: meta.dependencies})
        let fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType, meta, userId: ctx.request.userId})
        let fileUploadAsync = app.upload.putStream(`resources/${resourceType}/${fileName}`.toLowerCase(), fileStream)

        const resourceInfo = await Promise.all([fileCheckAsync, fileUploadAsync, dependencyCheck]).then(([metaInfo, uploadData, dependencies]) => new Object({
            resourceId: metaInfo.systemMeta.sha1,
            status: app.resourceStatus.NORMAL,
            resourceType,
            meta: meta,
            systemMeta: Object.assign(metaInfo.systemMeta, dependencies),
            resourceUrl: uploadData.url,
            userId: userInfo.userId,
            userName: userInfo.userName || userInfo.nickname,
            resourceName: resourceName === undefined ?
                ctx.helper.stringExpand.cutString(metaInfo.systemMeta.sha1, 10) :
                ctx.helper.stringExpand.cutString(resourceName, 80),
            mimeType: metaInfo.systemMeta.mimeType,
            previewImages: app.type.nullOrUndefined(previewImage) ? [] : [previewImage],
            description: app.type.nullOrUndefined(description) ? '' : description,
            intro: this._getResourceIntroFromDescription(description),
            createDate: moment().toDate(),
            updateDate: moment().toDate()
        })).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        await ctx.dal.resourceProvider.getResourceInfo({resourceId: resourceInfo.resourceId}).then(resource => {
            resource && ctx.error({msg: '资源已经被创建,不能创建重复的资源', data: resourceInfo.resourceId})
        })

        return ctx.dal.resourceProvider.createResource(resourceInfo, parentId)
            .then(() => ctx.dal.resourceTreeProvider.createResourceTree(ctx.request.userId, resourceInfo.resourceId, parentId))
            .then(() => resourceInfo)
    }

    /**
     * 更新资源
     * @param resourceId
     * @param model
     * @returns {Promise<void>}
     */
    async updateResource({resourceInfo, model}) {

        const {ctx, app} = this

        if (model.meta && Array.isArray(model.meta.dependencies)
            && !this._dependenciesCompare(model.meta.dependencies, resourceInfo.systemMeta.dependencies)) {
            if (ctx.service.authSchemeService.isExistValidAuthScheme(resourceInfo.resourceId)) {
                ctx.error({msg: '当前资源已经存在发布的授权方案,必须全部废弃才能修改资源依赖'})
            }
            let dependencies = await ctx.helper.resourceDependencyCheck({
                dependencies: model.meta.dependencies,
                resourceId: resourceInfo.resourceId
            }).catch(ctx.error)
            model.systemMeta = JSON.stringify(Object.assign(resourceInfo.systemMeta, dependencies))
            model.status = 1 //资源更新依赖,则资源直接下架,需要重新发布授权方案才可以上线
        }
        if (!app.type.nullOrUndefined(model.description)) {
            model.intro = this._getResourceIntroFromDescription(model.description)
        }
        if (model.previewImages) {
            model.previewImages = JSON.stringify(model.previewImages)
        }
        if (model.meta) {
            model.meta = JSON.stringify(model.meta)
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
     * 上床资源预览图
     * @param fileStream
     * @returns {Promise<void>}
     */
    async upoladPreviewImage(fileStream) {

        const {ctx, app, config} = this
        const fileCheckResult = await ctx.helper.subsidiaryFileCheck({
            fileStream,
            checkType: 'thumbnailImage'
        }).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        const uploadConfig = lodash.defaultsDeep({}, {aliOss: {bucket: 'freelog-image'}}, config.uploadConfig)
        const fileUrl = await app.uploadFile(uploadConfig).putBuffer(`preview/${uuid.v4()}.${fileCheckResult.fileExt}`, fileCheckResult.fileBuffer)
            .then(data => data.url)

        return fileUrl
    }

    /**
     * 从资源描述中获取简介信息
     * @param resourceDescription
     * @private
     */
    _getResourceIntroFromDescription(resourceDescription) {
        const {ctx, app} = this
        if (app.type.nullOrUndefined(resourceDescription)) {
            return ''
        }
        const removeHtmlTag = (input) => input.replace(/<[a-zA-Z0-9]+? [^<>]*?>|<\/[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?\/>|\r|\n/ig, "")
        return ctx.helper.stringExpand.cutString(removeHtmlTag(unescape(removeHtmlTag(resourceDescription)), 100));
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

