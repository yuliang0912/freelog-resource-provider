'use strict'

const uuid = require('uuid')

module.exports = class CreateMockResourceEventHandler {

    constructor(app) {
        this.app = app
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
    }

    /**
     * 创建mock事件处理
     * @param eventName
     * @param uploadFileInfo 上传的文件信息(新)
     * @param mockResourceInfo 原始mock信息(fillOss=null)
     * @returns {Promise<void>}
     */
    async handle(eventName, uploadFileInfo, mockResourceInfo) {

        const {objectKey, url} = await this.copyFile(uploadFileInfo, mockResourceInfo.bucketName)

        mockResourceInfo.updateOne({'fileOss.objectKey': objectKey, 'fileOss.url': url}).then(() => {
            return this.updateBucketInfo(mockResourceInfo.bucketId, mockResourceInfo.systemMeta.fileSize)
        }).catch(error => {
            console.error('CreateMockEvent-UpdateMockResourceInfo-error', error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile(uploadFileInfo, bucketName) {

        const {app} = this
        const {fileOss} = uploadFileInfo

        //此处的存储地址没有使用sha1值,考虑到草稿资源目前允许相同文件存在.防止误删.
        //以后做大了,可以考虑sha1值映射管理.这样同样的sha1值文件只存在一份,系统通过数据结果来管理.
        const targetResourceObjectKey = `mock_resources/${bucketName}/${uuid.v4()}`.toLowerCase()

        return app.ossClient.copyFile(targetResourceObjectKey, fileOss.objectKey).then(({res}) => Object({
            objectKey: targetResourceObjectKey,
            url: res.requestUrls[0] || fileOss.url.replace(fileOss.objectKey, targetResourceObjectKey)
        })).catch(error => {
            console.error("create-mock-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
            app.logger.error("create-mock-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
        })
    }

    /**
     * 更新bucket信息
     * @param bucketId
     * @param fluctuantFileSize
     * @returns {Promise<Query|Promise|*|void|OrderedBulkOperation|UnordedBulkOperation>}
     */
    async updateBucketInfo(bucketId, fluctuantFileSize) {
        return this.mockResourceBucketProvider.updateOne({_id: bucketId}, {
            $inc: {resourceCount: 1, totalFileSize: fluctuantFileSize}
        })
    }
}