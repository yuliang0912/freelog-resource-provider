/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

'use strict'

const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');

module.exports = class ResourcesController extends Controller {

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

        ctx.validate()

        const condition = {status: 2}
        if (resourceType) {
            condition.resourceType = resourceType
        }

        await ctx.dal.resourceProvider.searchPageList(condition, keyWords, page, pageSize).then(({totalItem, dataList}) => {
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

        var respositories = []
        const condition = {userId: ctx.request.userId}
        const totalItem = await ctx.dal.resourceProvider.getResourceCount(condition)

        if (totalItem > (page - 1) * pageSize) { //避免不必要的分页查询
            respositories = await ctx.dal.resourceProvider.getRespositories(condition, page, pageSize).catch(ctx.error)
        }
        if (respositories.length === 0) {
            ctx.success({page, pageSize, totalItem, dataList: []})
        }

        await ctx.dal.resourceProvider.getResourceByIdList(respositories.map(t => t.lastVersion))
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

        await ctx.dal.resourceProvider.getResourceInfo({resourceId}).then(ctx.success).catch(ctx.error)
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
        const resourceName = ctx.checkBody('resourceName').optional().len(4, 60).value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value

        ctx.allowContentType({type: 'json'}).validate()

        if (previewImages.length && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['http']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
            ctx.validate()
        }

        if (parentId) {
            const parentResource = await ctx.dal.resourceProvider.getResourceInfo({resourceId: parentId}).catch(ctx.error)
            if (!parentResource || parentResource.userId !== ctx.request.userId) {
                ctx.error({msg: 'parentId错误,或者没有权限引用'})
            }
        }

        await ctx.service.resourceService.createResource({
            sha1,
            resourceName,
            parentId,
            meta,
            description,
            previewImages
        }).then(ctx.success).catch(ctx.error)
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
        }).then(ctx.success).catch(ctx.error)
    }

    /**
     * 更新资源
     * @returns {Promise.<void>}
     */
    async update(ctx) {

        const resourceId = ctx.checkParams("id").isResourceId().value
        const meta = ctx.checkBody('meta').optional().isObject().value
        const resourceName = ctx.checkBody('resourceName').optional().type('string').len(4, 60).value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value

        ctx.allowContentType({type: 'json'}).validate()

        if (previewImages.length && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['http']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
            ctx.validate()
        }

        if (meta === undefined && resourceName === undefined && previewImages === undefined) {
            ctx.error({msg: '缺少有效参数'})
        }

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId, userId: ctx.request.userId})
        if (!resourceInfo) {
            ctx.error({msg: '未找到有效资源'})
        }

        const model = {}
        if (meta) {
            model.meta = meta
        }
        if (resourceName) {
            model.resourceName = resourceName
        }
        if (description) {
            model.description = description
        }
        if (previewImages) {
            model.previewImages = previewImages
        }

        await ctx.service.resourceService.updateResource({resourceInfo, model}).then(ctx.success).catch(ctx.error)
    }

    /**
     * 获取资源列表
     * @returns {Promise.<void>}
     */
    async list(ctx) {

        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 1000).value

        ctx.validate()

        await ctx.dal.resourceProvider.getResourceByIdList(resourceIds).then(ctx.success).catch(ctx.error)
    }

    /**
     * 更新资源内容(开发阶段使用)
     * @param ctx
     * @returns {Promise.<void>}
     */
    async updateResourceContext(ctx) {

        const fileStream = await ctx.getFileStream()
        ctx.request.body = fileStream.fields

        const meta = ctx.checkBody('meta').toJson().value
        const resourceId = ctx.checkParams("resourceId").isResourceId().value

        if (!fileStream || !fileStream.filename) {
            ctx.errors.push({file: 'Can\'t found upload file'})
        }

        ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

        const resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            ctx.error({msg: `resourceId:${resourceId}错误,未能找到有效资源`})
        }

        const fileName = ctx.helper.uuid.v4().replace(/-/g, '')

        const fileCheckAsync = ctx.helper.resourceFileCheck({
            fileStream,
            resourceType: resourceInfo.resourceType,
            meta,
            userId: ctx.request.userId
        })
        const fileUploadAsync = ctx.app.ossClient.putStream(`resources/${resourceInfo.resourceType}/${fileName}`.toLowerCase(), fileStream)

        const updateResourceInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => new Object({
            meta: JSON.stringify(meta),
            systemMeta: JSON.stringify(metaInfo.systemMeta),
            resourceUrl: uploadData.url,
            mimeType: metaInfo.systemMeta.mimeType
        })).catch(err => {
            sendToWormhole(fileStream)
            ctx.error(err)
        })

        await ctx.dal.resourceProvider.updateResourceInfo(updateResourceInfo, {resourceId}).then(() => {
            resourceInfo.meta = JSON.parse(updateResourceInfo.meta)
            resourceInfo.systemMeta = JSON.parse(updateResourceInfo.systemMeta)
            resourceInfo.resourceUrl = updateResourceInfo.resourceUrl
            resourceInfo.mimeType = updateResourceInfo.mimeType
            ctx.success(resourceInfo)
        }).catch(ctx.error)

        if (resourceInfo.resourceType === ctx.app.resourceType.WIDGET) {
            await ctx.dal.componentsProvider.create({
                widgetName: resourceInfo.systemMeta.widgetName,
                version: resourceInfo.systemMeta.version,
                resourceId: resourceInfo.resourceId,
                userId: resourceInfo.userId
            }).catch(console.error)
        }
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
    async upoladPreviewImage(ctx) {

        const fileStream = await ctx.getFileStream()
        if (!fileStream || !fileStream.filename) {
            ctx.error({msg: 'Can\'t found upload file'})
        }

        await ctx.service.resourceService.uploadPreviewImage(fileStream).then(ctx.success).catch(ctx.error)
    }
}
