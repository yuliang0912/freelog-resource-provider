'use strict'

module.exports = class CreateResourceEventHandler {

    constructor(app) {
        this.app = app
        this.resourceProvider = app.dal.resourceProvider
    }

    /**
     * 创建mock事件处理
     * @param eventName
     * @param uploadFileInfo 上传的文件信息(新)
     * @param mockResourceInfo 原始mock信息(fillOss=null)
     * @returns {Promise<void>}
     */
    async handle(eventName, uploadFileInfo, resourceInfo) {

        const {objectKey, url} = await this.copyFile(uploadFileInfo, resourceInfo.resourceId, resourceInfo.resourceType)

        return resourceInfo.updateOne({status: 1, 'fileOss.objectKey': objectKey, 'fileOss.url': url}).catch(error => {
            console.error('CreateMockEvent-UpdateResourceInfo-error', error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile(uploadFileInfo, resourceId, resourceType) {

        const {app} = this
        const {fileOss} = uploadFileInfo

        const targetResourceObjectKey = `resources/${resourceType}/${resourceId}`.toLowerCase()
        return app.ossClient.copyFile(targetResourceObjectKey, fileOss.objectKey).then(({res}) => Object({
            objectKey: targetResourceObjectKey,
            url: res.requestUrls[0] || fileOss.url.replace(fileOss.objectKey, targetResourceObjectKey)
        })).catch(error => {
            console.error("create-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
            app.logger.error("create-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
        })
    }
}