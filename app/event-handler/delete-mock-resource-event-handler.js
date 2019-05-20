'use strict'

module.exports = class DeleteMockResourceEventHandler {

    constructor(app) {
        this.app = app
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
    }

    /**
     * 创建mock事件处理
     * @param eventName
     * @param mockResourceInfo 原始mock信息(fillOss=null)
     * @returns {Promise<void>}
     */
    async handle(eventName, mockResourceInfo) {

        const {fileOss, systemMeta} = mockResourceInfo
        this.app.ossClient.deleteFile(fileOss.objectKey)

        return this.updateBucketInfo(mockResourceInfo.bucketId, systemMeta.fileSize * -1)
    }

    /**
     * 更新bucket信息
     * @param bucketId
     * @param fluctuantFileSize
     * @returns {Promise<Query|Promise|*|void|OrderedBulkOperation|UnordedBulkOperation>}
     */
    async updateBucketInfo(bucketId, fluctuantFileSize) {
        return this.mockResourceBucketProvider.updateOne({_id: bucketId}, {
            $inc: {resourceCount: -1, totalFileSize: fluctuantFileSize}
        })
    }
}