'use strict'

const resourceEvents = require('../enum/resource-events')

module.exports = class ResourceEventHandler {

    constructor(app) {
        this.app = app
        this.__registerEventHandler__()
    }

    /**
     * 创建资源的版本树
     */
    async createResourceTree({resourceInfo, parentId}) {

        await this.app.dal.resourceTreeProvider.createResourceTree(resourceInfo.userId, resourceInfo.resourceId, parentId).catch(error => {
            console.error("createResourceEvent-createResourceTree-error", error)
        })
    }

    /**
     * 删除上传的文件临时信息
     */
    async deleteUploadFileInfo({resourceInfo}) {

        await this.app.dal.uploadFileInfoProvider.deleteOne({
            sha1: resourceInfo.resourceId,
            userId: resourceInfo.userId
        }).catch(error => {
            console.error("createResourceEvent-deleteUploadFileInfo-error", error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile({resourceObjectKey, uploadObjectKey}) {
        this.app.ossClient.copyFile(resourceObjectKey, uploadObjectKey).catch(error => {
            console.error("createResourceEvent-copyFile-error", error)
        })
    }

    /**
     * 注册事件处理者
     * @private
     */
    __registerEventHandler__() {

        // arguments : {resourceInfo, resourceObjectKey, uploadObjectKey, parentId}
        this.app.on(resourceEvents.createResourceEvent, (...args) => this.createResourceTree(...args))
        this.app.on(resourceEvents.createResourceEvent, (...args) => this.deleteUploadFileInfo(...args))
        this.app.on(resourceEvents.createResourceEvent, (...args) => this.copyFile(...args))

    }
}