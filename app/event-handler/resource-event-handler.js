'use strict'

const resourceEvents = require('../enum/resource-events')

module.exports = class ResourceEventHandler {

    constructor(app) {
        this.app = app
        this.resourceTreeProvider = app.dal.resourceTreeProvider
        this.uploadFileInfoProvider = app.dal.uploadFileInfoProvider
        this.componentsProvider = app.dal.componentsProvider
        this.__registerEventHandler__()
    }

    /**
     * 创建资源的版本树
     */
    async createResourceTree({resourceInfo, parentId}) {

        const {app, resourceTreeProvider} = this

        await resourceTreeProvider.createResourceTree(resourceInfo.userId, resourceInfo.resourceId, parentId).catch(error => {
            console.error('createResourceEvent-createResourceTree-error', error)
            app.logger.error('createResourceEvent-createResourceTree-error', error)
        })
    }

    /**
     * 删除上传的文件临时信息
     */
    async deleteUploadFileInfo({resourceInfo}) {

        const {app, uploadFileInfoProvider} = this

        await uploadFileInfoProvider.deleteOne({
            sha1: resourceInfo.resourceId,
            userId: resourceInfo.userId
        }).catch(error => {
            console.error("createResourceEvent-deleteUploadFileInfo-error", error)
            app.logger.error('createResourceEvent-deleteUploadFileInfo-error', error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile({resourceObjectKey, uploadObjectKey}) {

        const {app} = this

        await app.ossClient.copyFile(resourceObjectKey, uploadObjectKey).catch(error => {
            console.error("createResourceEvent-copyFile-error", error, resourceObjectKey, uploadObjectKey)
            app.logger.error("createResourceEvent-copyFile-error", error, resourceObjectKey, uploadObjectKey)
        })
    }

    /**
     * 创建插件
     * @param resourceInfo
     * @returns {Promise<void>}
     */
    async createComponents({resourceInfo}) {

        const {app, componentsProvider} = this

        if (resourceInfo.resourceType !== app.resourceType.WIDGET) {
            return
        }

        await componentsProvider.create({
            widgetName: resourceInfo.systemMeta.widgetName,
            version: resourceInfo.systemMeta.version,
            resourceId: resourceInfo.resourceId,
            userId: resourceInfo.userId
        }).catch(error => {
            console.error('createResourceEvent-createComponents-error', error)
            app.logger.error('createResourceEvent-createComponents-error', error)
        })
    }

    /**
     * 注册事件处理者
     * @private
     */
    __registerEventHandler__() {

        // arguments : {resourceInfo, resourceObjectKey, uploadObjectKey, parentId}

        this.app.on(resourceEvents.createResourceEvent, this.copyFile.bind(this))
        this.app.on(resourceEvents.createResourceEvent, this.createComponents.bind(this))
        this.app.on(resourceEvents.createResourceEvent, this.createResourceTree.bind(this))
        this.app.on(resourceEvents.createResourceEvent, this.deleteUploadFileInfo.bind(this))

    }
}