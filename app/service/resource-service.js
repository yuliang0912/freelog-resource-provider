'use strict'

const semver = require('semver')
const lodash = require('lodash')
const Service = require('egg').Service
const {ApplicationError} = require('egg-freelog-base/error')
const {createResourceEvent} = require('../enum/resource-events')

module.exports = class ResourceService extends Service {

    constructor({app, request}) {
        super(...arguments)
        this.userId = request.userId
        this.releaseProvider = app.dal.releaseProvider
        this.resourceProvider = app.dal.resourceProvider
        this.temporaryUploadFileProvider = app.dal.temporaryUploadFileProvider
    }

    /**
     * 创建资源
     * @param uploadFileInfo
     * @param aliasName
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencies
     * @returns {Promise<*>}
     */
    async createResource({uploadFileInfo, aliasName, meta, description, previewImages, dependencies}) {

        const {ctx, app, userId} = this
        const {sha1, resourceType, systemMeta, fileOss} = uploadFileInfo

        await this.resourceProvider.findOne({resourceId: sha1}, 'resourceId').then(model => {
            if (model) {
                throw new ApplicationError(ctx.gettext('resource-create-duplicate-error'), {resourceId: sha1})
            }
        })

        systemMeta.dependencies = lodash.isArray(dependencies) ? dependencies : []

        await this._checkDependency(systemMeta.dependencies)

        const model = {
            resourceId: sha1, aliasName, meta, userId, previewImages, resourceType, fileOss, systemMeta,
            description: lodash.isString(description) ? description : '',
            intro: this.getResourceIntroFromDescription(description)
        }

        return this.resourceProvider.create(model).tap(resourceInfo => {
            app.emit(createResourceEvent, uploadFileInfo, resourceInfo)
        })
    }

    /**
     * 更新资源信息
     * @param resourceInfo
     * @param aliasName
     * @param meta
     * @param description
     * @param previewImages
     * @param dependencies
     * @returns {Promise<void>}
     */
    async updateResourceInfo({resourceInfo, aliasName, meta, description, previewImages, dependencies}) {

        var model = {}
        if (lodash.isObject(meta)) {
            model.meta = meta
        }
        if (lodash.isString(aliasName)) {
            model.aliasName = aliasName
        }
        if (lodash.isString(description)) {
            model.description = description
            model.intro = this.getResourceIntroFromDescription(description)
        }
        if (lodash.isArray(previewImages)) {
            model.previewImages = previewImages
        }
        if (dependencies) {
            await this._checkDependency(dependencies)
            model['systemMeta.dependencies'] = dependencies
        }

        return this.resourceProvider.findOneAndUpdate({resourceId: resourceInfo.resourceId}, model, {new: true})
    }

    /**
     * 从资源描述中获取简介信息
     * @param resourceDescription
     * @private
     */
    getResourceIntroFromDescription(resourceDescription) {

        if (!lodash.isString(resourceDescription)) {
            return ''
        }

        const removeHtmlTag = (input) => input.replace(/<[a-zA-Z0-9]+? [^<>]*?>|<\/[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?>|<[a-zA-Z0-9]+?\/>|\r|\n/ig, "")

        return lodash.truncate(lodash.unescape(removeHtmlTag(resourceDescription)), {
            length: 100, omission: ''
        })
    }


    /**
     * 检查依赖参数
     * 1:校验依赖的发行是否存在并且上架
     * 2:校验依赖的发行版本范围是否真实有效(发行最少需要有一个版本满足设定的范围)
     * 备注:循环依赖,目前还无法检测.因为依赖的发行版本在变,而且资源此时还没有转换成发行
     * @param dependencies
     * @returns {Promise<*>}
     * @private
     */
    async _checkDependency(dependencies) {

        if (!dependencies.length) {
            return
        }

        const {ctx} = this
        const invalidDependencies = [], invalidReleaseVersionRanges = []  //signAuthFailedDependencies = []

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
        //签约授权暂时不考虑 可能废弃
        // if (signAuthFailedDependencies.length) {
        //     throw new ApplicationError(ctx.gettext('resource-depend-release-sign-auth-refuse'), {signAuthFailedDependencies})
        // }
    }
}