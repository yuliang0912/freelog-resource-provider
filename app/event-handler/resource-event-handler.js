'use strict'

const {createResourceEvent} = require('../enum/resource-events')

module.exports = class ResourceEventHandler {

    constructor(app) {
        this.app = app
        this.resourceProvider = app.dal.resourceProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * 资源相关事件处理入口
     * @param eventName
     * @param uploadFileInfo
     * @param resourceInfo
     * @returns {Promise<void>}
     */
    async handle(eventName, {uploadFileInfo, resourceInfo}) {

        if (eventName !== createResourceEvent) {
            return
        }

        return this.copyFile({uploadFileInfo, resourceInfo})
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile({uploadFileInfo, resourceInfo}) {

        const {app} = this
        const {fileOss} = uploadFileInfo

        //此处的存储地址没有使用sha1值,考虑到草稿资源目前允许相同文件存在.防止误删.
        // //以后做大了,可以考虑sha1值映射管理.这样同样的sha1值文件只存在一份,系统通过数据结果来管理.
        const targetResourceObjectKey = `resources/${resourceInfo.resourceType}/${resourceInfo.resourceId}`.toLowerCase()

        await app.ossClient.copyFile(targetResourceObjectKey, fileOss.objectKey).then(({res}) => {
            resourceInfo.fileOss.objectKey = targetResourceObjectKey
            resourceInfo.fileOss.url = res.requestUrls[0] || fileOss.url.replace(fileOss.objectKey, targetResourceObjectKey)
            return resourceInfo.updateOne({status: 1, fileOss: resourceInfo.fileOss})
        }).catch(error => {
            console.error("createResourceEvent-copyFile-error", error, targetResourceObjectKey, fileOss.objectKey)
            app.logger.error("createResourceEvent-copyFile-error", error, targetResourceObjectKey, fileOss.objectKey)
        })
    }
}