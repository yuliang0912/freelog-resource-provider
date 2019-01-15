/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

'use strict'

const lodash = require('lodash')
const Controller = require('egg').Controller
const sendToWormhole = require('stream-wormhole');

module.exports = class ResourcesController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.resourceProvider = app.dal.resourceProvider
    }

    /**
     * 资源仓库
     * @param ctx
     * @returns {Promise.<void>}
     */
    async warehouse(ctx) {

        const page = ctx.checkQuery("page").default(1).gt(0).toInt().value
        const pageSize = ctx.checkQuery("pageSize").default(10).gt(0).lt(101).toInt().value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value
        const keyWords = ctx.checkQuery("keyWords").optional().decodeURIComponent().value

        ctx.validate(false)

        const condition = {status: 2}
        if (resourceType) {
            condition.resourceType = resourceType
        }

        await this.resourceProvider.searchPageList(condition, keyWords, page, pageSize).then(({totalItem, dataList}) => {
            ctx.success({page, pageSize, totalItem, dataList})
        })
    }

    /**
     * 资源列表展示
     * @param ctx
     * @returns {Promise.<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery('page').optional().gt(0).toInt().default(1).value
        const pageSize = ctx.checkQuery('pageSize').optional().gt(0).lt(101).toInt().default(10).value
        ctx.validate()

        var repositories = []
        const condition = {userId: ctx.request.userId}
        const totalItem = await this.resourceProvider.getResourceCount(condition)

        if (totalItem > (page - 1) * pageSize) { //避免不必要的分页查询
            repositories = await this.resourceProvider.getRepositories(condition, page, pageSize).catch(ctx.error)
        }
        if (repositories.length === 0) {
            ctx.success({page, pageSize, totalItem, dataList: []})
        }

        await this.resourceProvider.getResourceByIdList(repositories.map(t => t.lastVersion))
            .then(dataList => ctx.success({page, pageSize, totalItem, dataList}))
    }

    /**
     * 单个资源展示
     * @param ctx
     * @returns {Promise.<void>}
     */
    async show(ctx) {
        const resourceId = ctx.checkParams('id').isResourceId().value

        ctx.validate(false)

        await this.resourceProvider.getResourceInfo({resourceId}).then(ctx.success).catch(ctx.error)
    }

    /**
     * 下载资源(内部测试用)
     * @param ctx
     * @returns {Promise<void>}
     */
    async download(ctx) {

        const resourceId = ctx.checkParams('resourceId').isResourceId().value

        ctx.validate(false)

        const resourceInfo = await this.resourceProvider.getResourceInfo({resourceId})

        const result = await ctx.curl(resourceInfo.resourceUrl, {streaming: true})
        ctx.attachment(resourceInfo.resourceId)
        Object.keys(result.headers).forEach(key => ctx.set(key, result.headers[key]))
        ctx.body = result.res
        ctx.set('content-type', resourceInfo.mimeType)
    }

    /**
     * 创建资源
     * @param ctx fileStream WIKI: https://eggjs.org/zh-cn/basics/controller.html
     * @returns {Promise.<void>}
     */
    async create(ctx) {

        const sha1 = ctx.checkBody('sha1').exist().isResourceId('sha1值格式错误').value
        const meta = ctx.checkBody('meta').optional().default({}).isObject().value
        const parentId = ctx.checkBody('parentId').optional().isResourceId().value
        const resourceName = ctx.checkBody('resourceName').optional().len(3, 60).value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).default([]).value
        const widgetInfo = ctx.checkBody('widgetInfo').optional().default({}).isObject().value

        ctx.allowContentType({type: 'json'}).validate()

        if (previewImages.length && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
            ctx.validate()
        }

        if (parentId) {
            const parentResource = await this.resourceProvider.getResourceInfo({resourceId: parentId})
            if (!parentResource || parentResource.userId !== ctx.request.userId) {
                ctx.error({msg: 'parentId错误,或者没有权限引用'})
            }
        }

        await ctx.service.resourceService.createResource({
            sha1, resourceName, parentId, meta, description, previewImages, dependencies, widgetInfo
        }).then(ctx.success)
    }

    /**
     * 上传资源文件
     * @returns {Promise<void>}
     */
    async uploadResourceFile(ctx) {

        const fileStream = await ctx.getFileStream()
        ctx.request.body = fileStream.fields
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value
        if (!fileStream || !fileStream.filename) {
            ctx.errors.push({file: 'Can\'t found upload file'})
        }

        ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

        await ctx.service.resourceService.uploadResourceFile({
            fileStream,
            resourceType
        }).then(ctx.success)
    }

    /**
     * 更新资源
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        const resourceId = ctx.checkParams("id").isResourceId().value
        const meta = ctx.checkBody('meta').optional().isObject().value
        const resourceName = ctx.checkBody('resourceName').optional().type('string').len(3, 60).value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value
        const isOnline = ctx.checkBody('isOnline').optional().toInt().in([0, 1]).value

        ctx.allowContentType({type: 'json'}).validate()

        if (Array.isArray(previewImages) && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
            ctx.validate()
        }

        if ([meta, resourceName, description, isOnline, previewImages].every(x => x === undefined)) {
            ctx.error({msg: '缺少有效参数'})
        }

        const resourceInfo = await this.resourceProvider.getResourceInfo({resourceId, userId: ctx.request.userId})
        if (!resourceInfo) {
            ctx.error({msg: '未找到有效资源'})
        }

        await ctx.service.resourceService.updateResource({
            resourceInfo, meta, resourceName, description, previewImages, isOnline
        }).then(ctx.success)
    }

    /**
     * 获取资源列表
     * @returns {Promise.<void>}
     */
    async list(ctx) {

        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 1000).value

        ctx.validate(false)

        await this.resourceProvider.getResourceByIdList(resourceIds).then(ctx.success).catch(ctx.error)
    }

    /**
     * 更新资源内容(开发阶段使用)
     * @param ctx
     * @returns {Promise.<void>}
     */
    async updateResourceContext(ctx) {

        const fileStream = await ctx.getFileStream()
        ctx.request.body = fileStream.fields

        const resourceId = ctx.checkParams("resourceId").isResourceId().value

        if (!fileStream || !fileStream.filename) {
            ctx.errors.push({file: 'Can\'t found upload file'})
        }

        ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

        var resourceInfo = await this.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            ctx.error({msg: `resourceId:${resourceId}错误,未能找到有效资源`})
        }

        const fileName = ctx.helper.uuid.v4().replace(/-/g, '')

        const fileCheckAsync = ctx.helper.resourceFileCheck({
            fileStream, resourceType: resourceInfo.resourceType, userId: ctx.request.userId
        })

        const fileUploadAsync = ctx.app.ossClient.putStream(`resources/${resourceInfo.resourceType}/${fileName}`.toLowerCase(), fileStream)
        const model = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => {
            const systemMeta = lodash.defaultsDeep({dependencies: resourceInfo.systemMeta.dependencies}, metaInfo.systemMeta, resourceInfo.systemMeta)
            return {
                systemMeta: JSON.stringify(systemMeta),
                resourceUrl: uploadData.url,
                mimeType: systemMeta.mimeType
            }
        }).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        await this.resourceProvider.updateResourceInfo(model, {resourceId: resourceInfo.resourceId})
        await this.resourceProvider.getResourceInfo({resourceId}).then(ctx.success)
    }

    /**
     * 获取资源依赖树
     * @param ctx
     * @returns {Promise<void>}
     */
    async getResourceDependencyTree(ctx) {

        const resourceId = ctx.checkParams("resourceId").isResourceId().value

        await ctx.validate().service.resourceService.getResourceDependencyTree(resourceId).then(ctx.success)
    }

    /**
     * 上传预览图
     * @param ctx
     * @returns {Promise<void>}
     */
    async uploadPreviewImage(ctx) {

        const fileStream = await ctx.getFileStream()
        if (!fileStream || !fileStream.filename) {
            ctx.error({msg: 'Can\'t found upload file'})
        }

        await ctx.service.resourceService.uploadPreviewImage(fileStream).then(ctx.success)
    }

}
