'use strict'

const uuid = require('uuid')
const moment = require('moment')
const Service = require('egg').Service
const sendToWormhole = require('stream-wormhole')
const resourceEvents = require('../enum/resource-events')

class ResourceService extends Service {

    /**
     * 上传资源文件(暂存)
     * @param fileStream
     * @param resourceType
     * @returns {Promise<void>}
     */
    async uploadResourceFile({fileStream, resourceType}) {

        const {ctx, app} = this
        const userId = ctx.request.userId
        const extension = fileStream.filename.substr(fileStream.filename.lastIndexOf('.'))
        const objectKey = `temporary_upload/${ctx.helper.uuid.v4().replace(/-/g, '')}${extension}`.toLowerCase()
        const fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType})
        const fileUploadAsync = app.ossClient.putStream(objectKey, fileStream)

        const uploadFileInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => new Object({
            userId, objectKey, resourceType,
            sha1: metaInfo.systemMeta.sha1,
            resourceFileUrl: uploadData.url,
            systemMeta: metaInfo.systemMeta,
            expireDate: moment().add(30, "day").toDate()
        })).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId: uploadFileInfo.sha1}).catch(ctx.error)
        if (resourceInfo) {
            ctx.error({msg: '资源已经存在,不能上传重复的文件', data: {resourceInfo}})
        }

        return ctx.dal.uploadFileInfoProvider.create(uploadFileInfo).then(data => {
            return {sha1: uploadFileInfo.sha1}
        }).catch(ctx.error)
    }

    /**
     * 创建资源
     * @param resourceName
     * @param resourceType
     * @param parentId
     * @param meta
     * @param fileStream
     * @returns {Promise<void>}
     */
    async createResource({sha1, resourceName, parentId, meta, description, previewImages}) {

        const {ctx, app} = this
        const userInfo = ctx.request.identityInfo.userInfo

        await ctx.dal.resourceProvider.getResourceInfo({resourceId: sha1}).then(existResourceInfo => {
            existResourceInfo && ctx.error({msg: '资源已经被创建,不能创建重复的资源', data: {existResourceInfo}})
        })

        const uploadFileInfo = await ctx.dal.uploadFileInfoProvider.findOne({sha1, userId: userInfo.userId})
        if (!uploadFileInfo) {
            ctx.error({msg: '参数sha1校验失败,未能找到对应的资源文件信息'})
        }

        const resourceInfo = {
            meta,
            resourceId: sha1,
            status: app.resourceStatus.NORMAL,
            resourceType: uploadFileInfo.resourceType,
            systemMeta: uploadFileInfo.systemMeta,
            userId: userInfo.userId,
            userName: userInfo.userName || userInfo.nickname,
            resourceName: resourceName === undefined ?
                ctx.helper.stringExpand.cutString(uploadFileInfo.systemMeta.sha1, 10) :
                ctx.helper.stringExpand.cutString(resourceName, 80),
            mimeType: uploadFileInfo.systemMeta.mimeType,
            previewImages: previewImages,
            description: app.type.nullOrUndefined(description) ? '' : description,
            intro: this._getResourceIntroFromDescription(description),
            createDate: moment().toDate(),
            updateDate: moment().toDate()
        }

        const resourceObjectKey = `resources/${uploadFileInfo.resourceType}/${resourceInfo.resourceId}`
        resourceInfo.resourceUrl = uploadFileInfo.resourceFileUrl.replace(uploadFileInfo.objectKey, resourceObjectKey)

        await ctx.helper.resourceAttributeCheck(resourceInfo)
        await ctx.dal.resourceProvider.createResource(resourceInfo, parentId)

        app.emit(resourceEvents.createResourceEvent, {
            resourceInfo,
            resourceObjectKey,
            uploadObjectKey: uploadFileInfo.objectKey,
            parentId
        })

        return resourceInfo
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
            if (await ctx.service.authSchemeService.isExistValidAuthScheme(resourceInfo.resourceId)) {
                ctx.error({msg: '当前资源已经存在未废弃的授权方案,必须全部废弃才能修改资源依赖'})
            }
            const dependencies = await ctx.helper.resourceDependencyCheck({
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

        const {ctx} = this
        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            ctx.error({msg: '未找到有效资源'})
        }

        const dependencies = resourceInfo.systemMeta.dependencies || []

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
        const resourceIds = dependencies.map(item => item.resourceId)
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
    async uploadPreviewImage(fileStream) {

        const {ctx, app} = this
        const fileCheckResult = await ctx.helper.subsidiaryFileCheck({
            fileStream,
            checkType: 'thumbnailImage'
        }).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        const fileUrl = await app.previewImageOssClient.putBuffer(`preview/${uuid.v4()}.${fileCheckResult.fileExt}`, fileCheckResult.fileBuffer)
            .then(data => data.url.replace('-internal', ''))

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
        return ctx.helper.stringExpand.cutString(removeHtmlTag(unescape(removeHtmlTag(resourceDescription)), 100))
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

