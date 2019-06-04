'use strict'

const semver = require('semver')
const lodash = require('lodash')
const aliOss = require('ali-oss')
const Service = require('egg').Service
const {ApplicationError} = require('egg-freelog-base/error')
const {createMockResourceEvent, updateMockResourceFileEvent, deleteMockResourceEvent} = require('../enum/resource-events')

module.exports = class MockResourceService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.releaseProvider = app.dal.releaseProvider
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

        await this._checkDependency(systemMeta.dependencies)

        const model = {
            name, sha1, meta, userId, previewImages, resourceType, fileOss, systemMeta, bucketId: bucketInfo.id,
            bucketName: bucketInfo.bucketName,
            fullName: `${bucketInfo.bucketName}/${name}`,
            description: lodash.isString(description) ? description : '',
            intro: ctx.service.resourceService.getResourceIntroFromDescription(description)
        }

        const mockResourceInfo = await this.mockResourceProvider.create(model)

        app.emit(createMockResourceEvent, uploadFileInfo, mockResourceInfo)

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
     * @param resourceType
     * @returns {Promise<object>}
     */
    async updateMockResource({mockResourceInfo, uploadFileId, meta, description, previewImages, dependencies, resourceType}) {

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
            model.resourceType = uploadFileInfo.resourceType
        }
        //有新的上传文件,并且类型不一致或者没有新的上传文件,并且类型不一致,才需要重新计算systemMeta相关数据
        if (resourceType && (uploadFileId && uploadFileInfo.resourceType !== resourceType || !uploadFileId && mockResourceInfo.resourceType !== resourceType)) {
            const {fileOss} = uploadFileInfo || mockResourceInfo
            const ossClient = new aliOss(app.config.uploadConfig.aliOss)
            const metaInfo = await ossClient.getStream(fileOss.objectKey).then(result => {
                result.stream.filename = fileOss.filename
                return ctx.helper.resourceFileCheck({fileStream: result.stream, resourceType})
            })
            model.systemMeta = metaInfo.systemMeta
            model.sha1 = metaInfo.systemMeta.sha1
            model.resourceType = resourceType
        }

        if (lodash.isArray(dependencies)) {
            if (model.systemMeta) {
                model.systemMeta.dependencies = dependencies
            } else {
                model['systemMeta.dependencies'] = dependencies
            }
            await this._checkDependency(dependencies)
        }

        mockResourceInfo = await this.mockResourceProvider.findOneAndUpdate({_id: mockResourceInfo.id}, model, {new: true})

        if (uploadFileInfo) {
            //需要计算两个文件之间的大小差值,用于更新bucket信息
            app.emit(updateMockResourceFileEvent, uploadFileInfo, mockResourceInfo)
        }

        return mockResourceInfo
    }

    /**
     * 删除mock资源
     * @param mockId
     * @returns {Promise<void>}
     */
    async deleteMockResource(mockResourceInfo) {

        const {app} = this

        return this.mockResourceProvider.deleteOne({_id: mockResourceInfo.id}).then(data => {
            const isDelSuccess = Boolean(data.deletedCount)
            if (isDelSuccess) {
                app.emit(deleteMockResourceEvent, mockResourceInfo)
            }
            return isDelSuccess
        })
    }

    /**
     * 检查依赖
     * @param dependencies
     * @returns {Promise<void>}
     * @private
     */
    async _checkDependency(dependencies) {

        if (lodash.isEmpty(dependencies)) {
            return
        }

        const {ctx} = this
        const invalidDependencies = [], invalidReleaseVersionRanges = []

        //不允许依赖同一个发行的不同版本
        if (lodash.uniqBy(dependencies, x => x.releaseId).length !== dependencies.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-invalid'), dependencies)
        }

        const releaseMap = await this.releaseProvider.find({_id: {$in: dependencies.map(x => x.releaseId)}})
            .then(list => new Map(list.map(x => [x.releaseId, x])))

        for (let i = 0, j = dependencies.length; i < j; i++) {
            let dependency = dependencies[i]
            let releaseInfo = releaseMap.get(dependency.releaseId)
            if (!releaseInfo || releaseInfo.status !== 1) {
                invalidDependencies.push(dependency)
                continue
            }
            dependency.releaseName = releaseInfo.releaseName
            //如果依赖的发行有任意的版本符合资源作者设置的版本范围,则范围有效,否则属于无效的版本设置
            if (!releaseInfo.resourceVersions.some(x => semver.satisfies(x.version, dependency.versionRange))) {
                invalidReleaseVersionRanges.push(dependency)
            }
        }

        if (invalidDependencies.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-invalid'), {invalidDependencies})
        }
        if (invalidReleaseVersionRanges.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-versionRange-invalid'), {invalidReleaseVersionRanges})
        }
    }
}