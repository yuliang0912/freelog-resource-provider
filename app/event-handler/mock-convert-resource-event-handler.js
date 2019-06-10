'use strict'

module.exports = class MockConvertToResourceEventHandler {

    constructor(app) {
        this.app = app
        this.resourceProvider = app.dal.resourceProvider
    }

    /**
     * 创建mock事件处理
     * @param eventName
     * @param resourceInfo
     * @returns {Promise<void>}
     */
    async handle(eventName, resourceInfo) {

        const {resourceId, resourceType, fileOss} = resourceInfo
        const {objectKey, url} = await this.copyFile(fileOss, resourceId, resourceType)

        return resourceInfo.updateOne({status: 1, 'fileOss.objectKey': objectKey, 'fileOss.url': url}).catch(error => {
            console.error('mockConvertResourceEvent-UpdateResourceInfo-error', error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile(fileOss, resourceId, resourceType) {

        const {app} = this
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