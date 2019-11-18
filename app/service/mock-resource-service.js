'use strict'

const semver = require('semver')
const lodash = require('lodash')
const aliOss = require('ali-oss')
const Service = require('egg').Service
const {ApplicationError} = require('egg-freelog-base/error')
const {createMockResourceEvent, updateMockResourceFileEvent, deleteMockResourceEvent, mockConvertToResourceEvent} = require('../enum/resource-events')

module.exports = class MockResourceService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
    }

    /**
     * 创建草稿资源
     * @param uploadFileInfo
     * @param bucketInfo
     * @param name
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencyInfo
     * @returns {Promise<void>}
     */
    async createMockResource({uploadFileInfo, bucketInfo, name, meta, description, previewImages, dependencyInfo}) {

        const {ctx, app, userId} = this
        const {bucketId, bucketName} = bucketInfo

        const isExistMock = await this.mockResourceProvider.count({name, bucketId}).then(Boolean)
        if (isExistMock) {
            throw new ApplicationError(ctx.gettext('mock-name-create-duplicate-error', name))
        }

        const {sha1, resourceType, systemMeta, fileOss} = uploadFileInfo

        systemMeta.dependencyInfo = await this._checkDependencyInfo(dependencyInfo)

        const model = {
            name, sha1, meta, userId, previewImages, resourceType, fileOss, systemMeta, bucketId, bucketName,
            fullName: `${bucketName}/${name}`,
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
     * @param uploadFileInfo
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencyInfo
     * @param resourceType
     * @returns {Promise<Collection~findAndModifyWriteOpResultObject.mockResourceInfo|*>}
     */
    async updateMockResource({mockResourceInfo, uploadFileInfo, meta, description, previewImages, dependencyInfo, resourceType}) {

        const model = {}
        const {ctx, app} = this
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
        if (uploadFileInfo) {
            model.sha1 = uploadFileInfo.sha1
            model.resourceType = uploadFileInfo.resourceType
        }
        if (resourceType && mockResourceInfo.resourceType !== resourceType && !uploadFileInfo) {
            const {fileOss} = mockResourceInfo
            const ossClient = new aliOss(app.config.uploadConfig.aliOss)
            const metaInfo = await ossClient.getStream(fileOss.objectKey).then(result => {
                result.stream.filename = fileOss.filename
                return ctx.helper.resourceFileCheck({fileStream: result.stream, resourceType})
            })
            model.systemMeta = metaInfo.systemMeta
        }
        if (!lodash.isEmpty(dependencyInfo)) {
            await this._checkDependencyInfo(dependencyInfo)
            if (uploadFileInfo) {
                uploadFileInfo.systemMeta.dependencyInfo = dependencyInfo
            } else if (model.systemMeta) {
                model.systemMeta.dependencyInfo = dependencyInfo
            } else {
                model['systemMeta.dependencyInfo'] = dependencyInfo
            }
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
     * @param mockResourceInfo
     * @returns {Promise<Promise<boolean> | Promise>}
     */
    async deleteMockResource(mockResourceInfo) {

        return this.mockResourceProvider.deleteOne({_id: mockResourceInfo.id}).then(data => {
            const isDelSuccess = Boolean(data.deletedCount)
            if (isDelSuccess) {
                this.app.emit(deleteMockResourceEvent, mockResourceInfo)
            }
            return isDelSuccess
        })
    }

    /**
     * mock转资源
     * @param mockResourceInfo
     * @param resourceAliasName
     * @returns {Promise<void>}
     */
    async convertToResource(mockResourceInfo, resourceAliasName) {

        const {ctx, app} = this
        const {mocks = [], releases = []} = mockResourceInfo.systemMeta.dependencyInfo || {}

        if (!lodash.isEmpty(mocks)) {
            throw new ApplicationError(ctx.gettext('mock-convert-to-resource-depend-validate-failed'))
        }

        await this.resourceProvider.findOne({resourceId: mockResourceInfo.sha1}, 'resourceId').then(model => {
            if (model) {
                throw new ApplicationError(ctx.gettext('resource-create-duplicate-error'))
            }
        })

        const model = lodash.pick(mockResourceInfo, ['meta', 'userId', 'previewImages', 'resourceType', 'fileOss', 'systemMeta', 'description'])
        model.resourceId = mockResourceInfo.sha1
        model.aliasName = resourceAliasName
        model.intro = ctx.service.resourceService.getResourceIntroFromDescription(mockResourceInfo.description)
        model.systemMeta.dependencies = releases

        delete model.systemMeta.dependencyInfo

        return this.resourceProvider.create(model).tap(resourceInfo => {
            app.emit(mockConvertToResourceEvent, resourceInfo)
        })
    }


    /**
     * mock依赖树
     * @param mockResourceInfo
     * @param isContainRootNode
     * @returns {Promise<*>}
     */
    async mockDependencyTree(mockResourceInfo, isContainRootNode = false) {

        const {mocks = [], releases = []} = mockResourceInfo.systemMeta.dependencyInfo || {}

        if (!isContainRootNode) {
            return this.__buildMockDependencyTree(mocks, releases)
        }

        return [{
            mockResourceId: mockResourceInfo.id,
            mockResourceName: mockResourceInfo.fullName,
            resourceType: mockResourceInfo.resourceType,
            dependencies: await this.__buildMockDependencyTree(mocks, releases)
        }]
    }


    /**
     * 构建发行依赖树
     * @param releases
     * @returns {Promise<Array>}
     * @private
     */
    async __buildMockDependencyTree(dependMocks = [], dependReleases = []) {

        let dependReleaseTrees = [], dependMockTrees = []
        if (dependReleases.length) {
            dependReleaseTrees = await this.ctx.service.releaseService._buildDependencyTree(dependReleases, 200)
        }
        if (dependMocks.length) {
            const mockInfos = await this.mockResourceProvider.find({_id: {$in: dependMocks.map(x => x.mockResourceId)}})
            for (let i = 0; i < mockInfos.length; i++) {
                let mockInfo = mockInfos[i]
                const {mocks = [], releases = []} = mockInfo.systemMeta.dependencyInfo || {}
                mockInfo.dependencies = await this.__buildMockDependencyTree(mocks, releases)
                dependMockTrees.push({
                    mockResourceId: mockInfo.id,
                    mockResourceName: mockInfo.fullName,
                    resourceType: mockInfo.resourceType,
                    dependencies: mockInfo.dependencies,
                })
            }
        }

        return [...dependReleaseTrees, ...dependMockTrees]
    }


    /**
     * 检查依赖信息
     * @param dependencyInfo
     * @returns {Promise<{releases: Array, mocks: Array}>}
     * @private
     */
    async _checkDependencyInfo(dependencyInfo) {

        const {ctx} = this
        var {releases = [], mocks = []} = dependencyInfo

        let invalidDependReleases = [], invalidReleaseVersionRanges = [], invalidDependMocks = []

        //不允许依赖同一个发行的不同版本
        if (lodash.uniqBy(releases, x => x.releaseId).length !== releases.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-invalid'), releases)
        }

        const releaseMap = new Map()
        if (!lodash.isEmpty(releases)) {
            await this.releaseProvider.find({_id: {$in: releases.map(x => x.releaseId)}}).each(x => releaseMap.set(x.releaseId, x))
        }

        for (let i = 0, j = releases.length; i < j; i++) {
            let dependency = releases[i]
            let releaseInfo = releaseMap.get(dependency.releaseId)
            if (!releaseInfo) {
                invalidDependReleases.push(dependency)
                continue
            }
            dependency.releaseName = releaseInfo.releaseName
            //如果依赖的发行有任意的版本符合资源作者设置的版本范围,则范围有效,否则属于无效的版本设置
            if (!releaseInfo.resourceVersions.some(x => semver.satisfies(x.version, dependency.versionRange))) {
                invalidReleaseVersionRanges.push(dependency)
            }
        }

        if (invalidDependReleases.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-invalid'), {invalidDependReleases})
        }
        if (invalidReleaseVersionRanges.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-release-versionRange-invalid'), {invalidReleaseVersionRanges})
        }

        if (!lodash.isEmpty(mocks)) {
            const mockInfos = await this.mockResourceProvider.find({
                _id: {$in: mocks.map(x => x.mockResourceId)},
                userId: ctx.request.userId
            })
            invalidDependMocks = lodash.differenceBy(mocks, mockInfos, x => x.mockResourceId)
            mocks = mockInfos.map(x => Object({
                mockResourceId: x.mockResourceId,
                mockResourceName: x.fullName
            }))
        }
        if (invalidDependMocks.length) {
            throw new ApplicationError(ctx.gettext('resource-depend-mock-invalid'), {invalidDependMocks})
        }

        dependencyInfo.mocks = mocks
        dependencyInfo.releases = releases

        return dependencyInfo
    }
}