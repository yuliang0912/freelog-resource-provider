'use strict'

const uuid = require('uuid')
const moment = require('moment')
const Service = require('egg').Service
const sendToWormhole = require('stream-wormhole')
const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class TemporaryUploadFileService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.resourceProvider = app.dal.resourceProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * 上传资源文件(暂存)
     * @param fileStream
     * @param resourceType
     * @returns {Promise<void>}
     */
    async uploadResourceFile({fileStream, resourceType}) {

        const {ctx, app, userId} = this

        const objectKey = `temporary_upload/${ctx.helper.uuid.v4().replace(/-/g, '')}`.toLowerCase()
        const fileCheckAsync = ctx.helper.resourceFileCheck({fileStream, resourceType})
        const fileUploadAsync = app.ossClient.putStream(objectKey, fileStream)

        const uploadFileInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => Object({
            userId, resourceType,
            sha1: metaInfo.systemMeta.sha1,
            systemMeta: metaInfo.systemMeta,
            resourceFileName: fileStream.filename,
            expireDate: moment().add(7, "day").toDate(),
            fileOss: {
                url: uploadData.url,
                objectKey: uploadData.name,
                bucket: app.config.uploadConfig.aliOss.bucket,
                region: app.config.uploadConfig.aliOss.region
            }
        })).catch(error => {
            sendToWormhole(fileStream)
            throw new ApplicationError(error.toString(), error)
        })

        const resourceInfo = await this.resourceProvider.findOne({resourceId: uploadFileInfo.sha1}, 'resourceId')

        return this.temporaryUploadFileProvider.create(uploadFileInfo).then(model => Object({
            sha1: model.sha1, uploadFileId: model.id, isExistResource: Boolean(resourceInfo)
        }))
    }

    /**
     * 上传资源预览图
     * @param fileStream
     * @returns {Promise<void>}
     */
    async uploadPreviewImage(fileStream) {

        const {ctx, app} = this
        const fileCheckResult = await ctx.helper.subsidiaryFileCheck({
            fileStream, checkType: 'thumbnailImage'
        }).catch(error => {
            sendToWormhole(fileStream)
            throw error
        })

        const fileUrl = await app.previewImageOssClient.putBuffer(`preview/${uuid.v4()}.${fileCheckResult.fileExt}`, fileCheckResult.fileBuffer)
            .then(data => data.url)

        return fileUrl.replace(/^http:\/\/freelog-image.oss-cn-shenzhen(-internal)?.aliyuncs.com\//i, "https://image.freelog.com/")
    }
}