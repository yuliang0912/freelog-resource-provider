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

        let page = ctx.checkQuery("page").default(1).gt(0).toInt().value
        let pageSize = ctx.checkQuery("pageSize").default(10).gt(0).lt(101).toInt().value
        let resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value
        let keyWords = ctx.checkQuery("keyWords").optional().decodeURIComponent().value

        ctx.validate()

        let condition = {status: 2}
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
        let page = ctx.checkQuery('page').optional().gt(0).toInt().default(1).value
        let pageSize = ctx.checkQuery('pageSize').optional().gt(0).lt(101).toInt().default(10).value

        let condition = {
            userId: ctx.request.userId
        }

        ctx.validate()

        let respositories = []
        let totalItem = await ctx.dal.resourceProvider.getResourceCount(condition)

        if (totalItem > (page - 1) * pageSize) { //避免不必要的分页查询
            respositories = await ctx.dal.resourceProvider
                .getRespositories(condition, page, pageSize)
                .catch(ctx.error)
        }

        if (respositories.length === 0) {
            ctx.success({page, pageSize, totalItem, dataList: []})
        }

        let lastVersionArray = respositories.map(t => t.lastVersion)

        let dataList = await ctx.dal.resourceProvider.getResourceByIdList(lastVersionArray)

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 单个资源展示
     * @param ctx
     * @returns {Promise.<void>}
     */
    async show(ctx) {
        let resourceIdMatch = new RegExp(`^([0-9a-zA-Z]{40})+(.${ctx.app.resourceAttribute.allAttributes.join('|.')})?$`)
        let resourceMatch = ctx.checkParams("id").match(resourceIdMatch, 'id格式匹配错误').value
        ctx.validate(false)

        //etag 缓存后期再实现
        // ctx.set('Last-Modified', '"W/123"')
        // ctx.set('ETag', '"123"')
        // console.log(ctx.header)
        // console.log(ctx.response.header)
        // if (ctx.fresh) {
        //     ctx.status = 304;
        //     return;
        // }

        let resourceId = resourceMatch.split('.')[0]
        let attribute = resourceMatch.split('.')[1]
        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId}).catch(ctx.error)

        if (!resourceInfo) {
            ctx.error({msg: '未找到资源'})
        }

        if (!attribute || !resourceInfo) {
            return ctx.success(resourceInfo)
        }

        let content = await ctx.curl(resourceInfo.resourceUrl)
        if (resourceInfo.mimeType === 'application/json') {
            ctx.success(JSON.parse(content.data.toString())[attribute])
        } else {
            ctx.success(content.data.toString())
        }

        // let resourceInfo = await ctx.validate().service.resourceService
        //     .getResourceInfo({resourceId})
        //
        // if (!resourceInfo) {
        //     ctx.error('未找到资源')
        // }
        //
        // /**
        //  * 资源实际展示示例
        //  */
        // await ctx.curl(resourceInfo.resourceUrl).then(res => {
        //     ctx.body = res.data
        //     ctx.set('Content-Type', resourceInfo.mimeType)
        //     // ctx.set('etag', file.headers['etag'])
        //     // ctx.set('last-modified', file.headers['last-modified'])
        // })
    }

    /**
     * 编辑资源
     * @param ctx
     * @returns {Promise.<void>}
     */
    async edit(ctx) {
        let resourceId = ctx.checkParams("id").isResourceId().value

        ctx.validate()

        await ctx.dal.resourceProvider
            .getResourceInfo({resourceId, userId: ctx.request.userId})
            .then(ctx.success)
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
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        const resourceName = ctx.checkBody('resourceName').optional().len(4, 60).value
        const description = ctx.checkBody('description').optional().type('string').value

        if (previewImages.length && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
        }

        ctx.allowContentType({type: 'json'}).validate()

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
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value

        if (previewImages.length && !previewImages.some(x => ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            ctx.errors.push({previewImages: '数组中必须是正确的url地址'})
        }

        ctx.allowContentType({type: 'json'}).validate()

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

        let resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 100).value

        ctx.validate()

        await ctx.dal.resourceProvider.getResourceByIdList(resourceIds).then(ctx.success).catch(ctx.error)
    }

    /**
     * 更新资源内容(开发阶段使用)
     * @param ctx
     * @returns {Promise.<void>}
     */
    async updateResourceContext(ctx) {

        let fileStream = await ctx.getFileStream()
        ctx.request.body = fileStream.fields

        let meta = ctx.checkBody('meta').toJson().value
        let resourceId = ctx.checkParams("resourceId").isResourceId().value

        if (!fileStream || !fileStream.filename) {
            ctx.errors.push({file: 'Can\'t found upload file'})
        }

        ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

        let resourceInfo = await ctx.dal.resourceProvider.getResourceInfo({resourceId})

        if (!resourceInfo) {
            ctx.error({msg: `resourceId:${resourceId}错误,未能找到有效资源`})
        }

        let fileName = ctx.helper.uuid.v4().replace(/-/g, '')

        let fileCheckAsync = ctx.helper.resourceFileCheck({
            fileStream,
            resourceType: resourceInfo.resourceType,
            meta,
            userId: ctx.request.userId
        })
        let fileUploadAsync = ctx.app.upload.putStream(`resources/${resourceInfo.resourceType}/${fileName}`.toLowerCase(), fileStream)

        const updateResourceInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).then(([metaInfo, uploadData]) => new Object({
            meta: meta,
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

        let resourceId = ctx.checkParams("resourceId").isResourceId().value

        await ctx.validate().service.resourceService.getResourceDependencyTree(resourceId).then(ctx.success)
    }

    /**
     * 上传预览图
     * @param ctx
     * @returns {Promise<void>}
     */
    async upoladPreviewImage(ctx) {

        let fileStream = await ctx.getFileStream()
        if (!fileStream || !fileStream.filename) {
            ctx.error({msg: 'Can\'t found upload file'})
        }

        await ctx.service.resourceService.upoladPreviewImage(fileStream).then(ctx.success).catch(ctx.error)
    }
}
