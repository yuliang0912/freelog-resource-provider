'use strict'

const uuid = require('uuid')
const moment = require('moment')
const lodash = require('lodash')
const Service = require('egg').Service
const sendToWormhole = require('stream-wormhole')
const resourceEvents = require('../enum/resource-events')
const {ApplicationError} = require('egg-freelog-base/error')


module.exports = class ResourceService extends Service {

    constructor({app}) {
        super(...arguments)
        this.resourceProvider = app.dal.resourceProvider
        this.authSchemeProvider = app.dal.authSchemeProvider
    }

    /**
     * 上传资源文件(暂存)
     * @param fileStream
     * @param resourceType
     * @returns {Promise<void>}
     */
    async uploadResourceFile({fileStream, resourceType}) {

        const {ctx, app, resourceProvider} = this
        const userId = ctx.request.userId
        const objectKey = `temporary_upload/${ctx.helper.uuid.v4().replace(/-/g, '')}`.toLowerCase()
        const fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType})
        const fileUploadAsync = app.ossClient.putStream(objectKey, fileStream)

        const uploadFileInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => new Object({
            userId, objectKey, resourceType,
            sha1: metaInfo.systemMeta.sha1,
            resourceFileUrl: uploadData.url,
            systemMeta: metaInfo.systemMeta,
            resourceFileName: fileStream.filename,
            expireDate: moment().add(30, "day").toDate()
        })).catch(error => {
            sendToWormhole(fileStream)
            throw new ApplicationError(error.toString(), error)
        })

        const resourceInfo = await resourceProvider.getResourceInfo({resourceId: uploadFileInfo.sha1})
        if (resourceInfo) {
            throw new ApplicationError('资源已经存在,不能上传重复的文件', {resourceInfo})
        }

        return ctx.dal.uploadFileInfoProvider.create(uploadFileInfo).then(() => new Object({sha1: uploadFileInfo.sha1}))
    }

    /**
     * 创建资源
     * @param resourceName
     * @param resourceType
     * @param parentId
     * @param meta
     * @param fileStream
     */
    async createResource({sha1, resourceName, parentId, meta, description, previewImages, dependencies, widgetInfo}) {

        const {ctx, app, resourceProvider} = this
        const {userInfo} = ctx.request.identityInfo
        const {userId, userName, nickname} = userInfo

        await resourceProvider.getResourceInfo({resourceId: sha1}).then(existResourceInfo => {
            if (existResourceInfo) {
                throw new ApplicationError('资源已经被创建,不能创建重复的资源', {existResourceInfo})
            }
        })

        const uploadFileInfo = await ctx.dal.uploadFileInfoProvider.findOne({sha1, userId})
        if (!uploadFileInfo) {
            throw new ApplicationError('参数sha1校验失败,未能找到对应的资源文件信息', {sha1, userId})
        }

        const resourceInfo = {
            meta, userId,
            resourceId: sha1,
            status: app.resourceStatus.NORMAL,
            resourceType: uploadFileInfo.resourceType,
            systemMeta: uploadFileInfo.systemMeta,
            userName: userName || nickname,
            resourceName: resourceName === undefined ?
                ctx.helper.stringExpand.cutString(uploadFileInfo.systemMeta.sha1, 10) :
                ctx.helper.stringExpand.cutString(resourceName, 80),
            mimeType: uploadFileInfo.systemMeta.mimeType,
            previewImages: previewImages,
            description: description === null || description === undefined ? '' : description,
            intro: this._getResourceIntroFromDescription(description),
            createDate: moment().toDate(),
            updateDate: moment().toDate()
        }

        const resourceObjectKey = `resources/${uploadFileInfo.resourceType}/${resourceInfo.resourceId}`
        resourceInfo.resourceUrl = uploadFileInfo.resourceFileUrl.replace(uploadFileInfo.objectKey, resourceObjectKey)

        const attachInfo = {dependencies, widgetInfo}
        await ctx.helper.resourceAttributeCheck(resourceInfo, attachInfo)
        await resourceProvider.createResource(resourceInfo, parentId)

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
    async updateResource({resourceInfo, meta, resourceName, description, previewImages, isOnline}) {

        const model = {}
        if (lodash.isString(description)) {
            model.description = description
            model.intro = this._getResourceIntroFromDescription(model.description)
        }
        if (lodash.isArray(previewImages)) {
            model.previewImages = JSON.stringify(previewImages)
        }
        if (lodash.isObject(meta)) {
            model.meta = JSON.stringify(model.meta)
        }
        if (lodash.isInteger(isOnline)) {
            model.status = isOnline ? 2 : 1
        }
        if (isOnline === 1) {
            const count = await this.authSchemeProvider.count({resourceId: resourceInfo.resourceId, status: 1})
            if (count < 1) {
                throw new ApplicationError(`资源不存在已启用的授权方案,无法发布上线`)
            }
        }
        return this.resourceProvider.updateResourceInfo(model, {resourceId: resourceInfo.resourceId})
    }

    /**
     * 获取资源的依赖树
     * @param resourceId
     * @param deep
     * @returns {Promise<void>}
     */
    async getResourceDependencyTree(resourceId, deep = 0) {

        const resourceInfo = await this.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            throw new ApplicationError('未找到有效资源', {resourceId})
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
     * @private
     */
    async buildDependencyTree(dependencies, currDeep = 1, maxDeep = 0) {

        if (!dependencies.length || currDeep++ < maxDeep) {
            return []
        }
        const resourceIds = dependencies.map(item => item.resourceId)
        return this.resourceProvider.getResourceByIdList(resourceIds).map(async item => new Object({
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
        return this.resourceProvider.updateResourceInfo({status}, {resourceId}).then(data => data)
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
        }).catch(error => {
            sendToWormhole(fileStream)
            throw new ApplicationError(error, toString(), {error})
        })

        const fileUrl = await app.previewImageOssClient.putBuffer(`preview/${uuid.v4()}.${fileCheckResult.fileExt}`, fileCheckResult.fileBuffer)
            .then(data => data.url)

        return fileUrl.replace(/^http:\/\/freelog-image.oss-cn-shenzhen(-internal)?.aliyuncs.com\//i, "https://image.freelog.com/")
    }

    /**
     * 从资源描述中获取简介信息
     * @param resourceDescription
     * @private
     */
    _getResourceIntroFromDescription(resourceDescription) {

        const {ctx} = this
        if (resourceDescription === undefined || resourceDescription === null) {
            return ''
        }
        const removeHtmlTag = (input) => input.replace(/<[a-zA-Z0-9]+? [^<>]*?>|<\/[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?\/>|\r|\n/ig, "")

        return ctx.helper.stringExpand.cutString(ctx.helper.htmlDecode(removeHtmlTag(resourceDescription)), 100)
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

