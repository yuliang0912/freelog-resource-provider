'use strict'

const uuid = require('uuid')
const {createMockResourceEvent, updateMockResourceFileEvent} = require('../enum/resource-events')

module.exports = class MockResourceEventHandler {

    constructor(app) {
        this.app = app
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * 事件处理
     * @param eventName
     * @param uploadFileInfo
     * @param mockResourceInfo
     * @returns {Promise<void>}
     */
    async handle(eventName, {uploadFileInfo, mockResourceInfo}) {

        switch (eventName) {
            case createMockResourceEvent:
            case updateMockResourceFileEvent:
                return this.copyFile({uploadFileInfo, mockResourceInfo})
            default:
                break
        }
    }

    /**
     * 删除上传的文件临时信息
     */
    async deleteTemporaryUploadFile(uploadFileInfo) {

        const {app} = this

        //oss上设置了统一的自动删除机制.
        //app.ossClient.deleteFile(uploadFileInfo.fileOss.objectKey)

        await this.temporaryUploadFileProvider.deleteOne({_id: uploadFileInfo.id}).catch(error => {
            console.error("createResourceEvent-deleteUploadFileInfo-error", error)
            app.logger.error('createResourceEvent-deleteUploadFileInfo-error', error)
        })
    }

    /**
     * 复制临时文件到正式文件夹
     */
    async copyFile({uploadFileInfo, mockResourceInfo}) {

        const {app} = this
        const {fileOss} = uploadFileInfo

        //此处的存储地址没有使用sha1值,考虑到草稿资源目前允许相同文件存在.防止误删.
        // //以后做大了,可以考虑sha1值映射管理.这样同样的sha1值文件只存在一份,系统通过数据结果来管理.
        const targetResourceObjectKey = `mock_resources/${mockResourceInfo.bucketName}/${uuid.v4()}`.toLowerCase()

        await app.ossClient.copyFile(targetResourceObjectKey, fileOss.objectKey).then(({res}) => {
            return mockResourceInfo.updateOne({
                'fileOss.objectKey': targetResourceObjectKey,
                'fileOss.url': res.requestUrls[0] || fileOss.url.replace(fileOss.objectKey, targetResourceObjectKey)
            })
        }).then(() => {
            return app.ossClient.deleteFile(mockResourceInfo.fileOss.objectKey) //删除替换之前的文件
            //临时上传文件的清理由定时任务处理
            //return this.deleteTemporaryUploadFile(uploadFileInfo)
        }).catch(error => {
            console.error("create-mock-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
            app.logger.error("create-mock-resource-event-copy-file-error", error, targetResourceObjectKey, fileOss.objectKey)
        })
    }

    /**
     * 更新bucket信息
     * @param mockResourceInfo
     * @returns {Promise<void>}
     */
    async updateBucketInfo({mockResourceInfo}) {

        const {bucketId, systemMeta} = mockResourceInfo

        return this.mockResourceBucketProvider.updateOne({_id: bucketId}, {
            $inc: {resourceCount: 1, totalFileSize: systemMeta.fileSize}
        })
    }
}