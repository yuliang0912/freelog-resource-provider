'use strict'

const lodash = require('lodash')
const Service = require('egg').Service
const {ApplicationError} = require('egg-freelog-base/error')
const {createMockResourceEvent, updateMockResourceFileEvent} = require('../enum/resource-events')

module.exports = class MockResourceService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * 创建草稿资源
     * @param uploadFileId
     * @param name
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencies
     * @param bucketName
     * @returns {Promise<void>}
     */
    async createMockResource({uploadFileId, name, meta, description, previewImages, dependencies, bucketName}) {

        const {ctx, app, userId} = this

        const uploadFileInfo = await this.temporaryUploadFileProvider.findById(uploadFileId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'uploadFileId'),
            data: {uploadFileId}
        }))

        const bucketInfo = await this.mockResourceBucketProvider.findOne({bucketName}).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'bucketName'),
            data: {bucketName}
        }))

        const isExistMock = await this.mockResourceProvider.count({name, bucketId: bucketInfo.id}).then(Boolean)
        if (isExistMock) {
            ctx.error({msg: ctx.gettext('mock-name-create-duplicate-error', name)})
        }

        const {sha1, resourceType, systemMeta, fileOss} = uploadFileInfo

        systemMeta.dependencies = lodash.isArray(dependencies) ? dependencies : []

        const model = {
            name, sha1, meta, userId, previewImages, resourceType, fileOss, systemMeta, bucketId: bucketInfo.id,
            bucketName: bucketInfo.bucketName,
            fullName: `${bucketInfo.bucketName}/${name}`,
            description: lodash.isString(description) ? description : '',
            intro: ctx.service.resourceService.getResourceIntroFromDescription(description)
        }

        const mockResourceInfo = await this.mockResourceProvider.create(model)

        app.emit(createMockResourceEvent, {uploadFileInfo, mockResourceInfo})

        return mockResourceInfo
    }

    /**
     * 更新草稿资源
     * @param mockResourceInfo
     * @param uploadFileId
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencies
     * @returns {Promise<object>}
     */
    async updateMockResource({mockResourceInfo, uploadFileId, meta, description, previewImages, dependencies}) {

        const {ctx, app} = this
        var model = {}, uploadFileInfo = null

        if (meta) {
            model.meta = meta
        }
        if (lodash.isString(description)) {
            model.description = description
            model.intro = ctx.service.resourceService.getResourceIntroFromDescription(description)
        }
        if (lodash.isArray(previewImages)) {
            model.previewImages = previewImages
        }
        if (uploadFileId) {
            uploadFileInfo = await this.temporaryUploadFileProvider.findById(uploadFileId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
                msg: ctx.gettext('params-validate-failed', 'uploadFileId'),
                data: {uploadFileId}
            }))
            model.sha1 = uploadFileInfo.sha1
            model.systemMeta = uploadFileInfo.systemMeta
            model.resourceType = uploadFileInfo.resourceType
        }

        mockResourceInfo = await this.mockResourceProvider.findOneAndUpdate({_id: mockResourceInfo.id}, model, {new: true})

        if (uploadFileInfo) {
            //后续需要计算两个文件之间的大小差值,用于更新bucket信息
            app.emit(updateMockResourceFileEvent, {uploadFileInfo, mockResourceInfo})
        }

        return mockResourceInfo
    }

    /**
     * 删除mock资源
     * @param mockId
     * @returns {Promise<void>}
     */
    async deleteMockResource(mockId) {

        const {ctx, app} = this
        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'mockId'),
            data: {mockId}
        }))

        return this.mockResourceProvider.deleteOne({_id: mockId}).then(data => {
            const isDelSuccess = Boolean(data.nModified)
            if (isDelSuccess) {
                app.ossClient.deleteFile(mockResourceInfo.fileOss.objectKey)
            }
            return isDelSuccess
        })
    }
}