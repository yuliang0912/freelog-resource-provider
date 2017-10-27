/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

'use strict'

const sendToWormhole = require('stream-wormhole');

module.exports = app => {
    return class ResourcesController extends app.Controller {

        /**
         * 资源仓库
         * @param ctx
         * @returns {Promise.<void>}
         */
        async warehouse(ctx) {
            let page = ctx.checkQuery("page").default(1).gt(0).toInt().value
            let pageSize = ctx.checkQuery("pageSize").default(10).gt(0).lt(101).toInt().value
            let resourceType = ctx.checkQuery('resourceType').default('').toLow().value

            if (resourceType !== '' && !ctx.helper.commonRegex.resourceType.test(resourceType)) {
                ctx.errors.push({resourceType: 'resourceType is error format'})
            }

            ctx.validate()

            let condition = {status: 2}
            if (resourceType) {
                condition.resourceType = resourceType
            }

            let dataList = []
            let totalItem = await ctx.service.resourceService.getResourceCount(condition).then(data => parseInt(data.count))

            if (totalItem > (page - 1) * pageSize) {
                dataList = await ctx.validate().service.resourceService
                    .getResourceList(condition, page, pageSize).bind(ctx)
                    .catch(ctx.error)
            }
            ctx.success({page, pageSize, totalItem, dataList})
        }

        /**
         * 资源列表展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async index(ctx) {
            let page = ctx.checkQuery('page').default(1).gt(0).toInt().value
            let pageSize = ctx.checkQuery('pageSize').default(10).gt(0).lt(101).toInt().value

            let condition = {
                userId: ctx.request.userId
            }

            ctx.validate()

            let respositories = []
            let totalItem = await ctx.service.resourceService.getCount(condition).then(data => parseInt(data.count))

            if (totalItem > (page - 1) * pageSize) { //避免不必要的分页查询
                respositories = await ctx.service.resourceService
                    .getRespositories(condition, page, pageSize).bind(ctx)
                    .catch(ctx.error)
            }

            if (respositories.length === 0) {
                ctx.success({page, pageSize, totalItem, dataList: []})
            }

            let lastVersionArray = respositories.map(t => t.lastVersion)

            let dataList = await ctx.service.resourceService
                .getResourceByIdList(lastVersionArray).bind(ctx).catch(ctx.error)

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
            ctx.validate()

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
            let resourceInfo = await ctx.validate().service.resourceService.getResourceInfo({resourceId}).bind(ctx).catch(ctx.error)

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

            await ctx.validate().service.resourceService
                .getResourceInfo({resourceId, userId: ctx.request.userId}).bind(ctx)
                .then(ctx.success)
        }

        /**
         * 创建资源
         * @param ctx fileStream WIKI: https://eggjs.org/zh-cn/basics/controller.html
         * @returns {Promise.<void>}
         */
        async create(ctx) {
            const stream = await ctx.getFileStream()
            ctx.request.body = stream.fields

            let meta = ctx.checkBody('meta').toJson().value
            let parentId = ctx.checkBody('parentId').default('').value
            let resourceName = ctx.checkBody('resourceName').default('').value
            let resourceType = ctx.checkBody('resourceType').isResourceType().value

            if (!stream || !stream.filename) {
                ctx.errors.push({file: 'Can\'t found upload file'})
            }

            if (parentId !== '' && !ctx.helper.commonRegex.resourceId.test(parentId)) {
                ctx.errors.push({parentId: 'parentId格式错误'})
            }

            ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

            if (parentId) {
                let parentResource = await ctx.service.resourceService.getResourceInfo({resourceId: parentId}).bind(ctx).catch(ctx.error)
                if (!parentResource || parentResource.userId !== ctx.request.userId) {
                    ctx.error({msg: 'parentId错误,或者没有权限引用'})
                }
            }

            let fileName = ctx.helper.uuid.v4().replace(/-/g, '')
            let fileCheckAsync = ctx.helper.resourceCheck.resourceFileCheck(stream, resourceName, resourceType, meta)
            let fileUploadAsync = ctx.app.upload.putStream(`resources/${resourceType}/${fileName}`.toLowerCase(), stream)

            const resourceInfo = await Promise.all([fileCheckAsync, fileUploadAsync]).spread((metaInfo, uploadData) => {
                if (metaInfo.errors.length) {
                    return Promise.reject(metaInfo.errors[0])
                }
                return {
                    resourceId: metaInfo.systemMeta.sha1,
                    status: ctx.app.resourceStatus.NORMAL,
                    resourceType: resourceType,
                    meta: JSON.stringify(metaInfo.meta),
                    systemMeta: JSON.stringify(metaInfo.systemMeta),
                    resourceUrl: uploadData.url,
                    userId: ctx.request.userId,
                    resourceName: resourceName === '' ?
                        ctx.helper.stringExpand.cutString(metaInfo.systemMeta.sha1, 10) :
                        ctx.helper.stringExpand.cutString(resourceName, 100),
                    mimeType: metaInfo.systemMeta.mimeType
                }
            }).catch(err => {
                sendToWormhole(stream)
                ctx.error(err)
            })

            await ctx.service.resourceService.getResourceInfo({resourceId: resourceInfo.resourceId}).then(resource => {
                resource && ctx.error({msg: '资源已经被创建,不能创建重复的资源', data: resourceInfo.resourceId})
            })

            await ctx.service.resourceService.createResource(resourceInfo, parentId).bind(ctx)
                .then(() => {
                    return ctx.service.resourceTreeService.createResourceTree(ctx.request.userId, resourceInfo.resourceId, parentId)
                })
                .then(() => {
                    resourceInfo.meta = JSON.parse(resourceInfo.meta)
                    resourceInfo.systemMeta = JSON.parse(resourceInfo.systemMeta)
                    ctx.success(resourceInfo)
                }).catch(ctx.error)

            if (resourceType === ctx.app.resourceType.WIDGET) {
                await ctx.service.componentsService.create({
                    widgetName: resourceInfo.systemMeta.widgetName,
                    resourceId: resourceInfo.resourceId,
                    userId: resourceInfo.userId
                }).catch(console.error)
            }
        }


        /**
         * 更新资源
         * @returns {Promise.<void>}
         */
        async update(ctx) {

            let resourceId = ctx.checkParams("id").isResourceId().value
            let meta = ctx.checkBody('meta').value
            let resourceName = ctx.checkBody('resourceName').value

            if (meta !== undefined && !ctx.app.type.object(meta)) {
                ctx.errors.push({meta: 'meta必须是json对象'})
            }
            if (resourceName !== undefined && (resourceName.length < 4 || resourceName.length > 20)) {
                ctx.errors.push({meta: 'resourceName长度必须在4-20字符之间'})
            }
            ctx.allowContentType({type: 'json'}).validate()

            let model = {}
            if (meta) {
                model.meta = JSON.stringify(meta)
            }
            if (resourceName) {
                model.resourceName = resourceName
            }

            if (!Object.keys(model).length) {
                ctx.error({msg: '无可更新内容'})
            }

            await ctx.service.resourceService.getResourceInfo({
                resourceId,
                userId: ctx.request.userId
            }).then(resourceInfo => {
                !resourceInfo && ctx.error({msg: '未找到有效资源'})
            }).then(() => {
                return ctx.service.resourceService.updateResourceInfo(model, {resourceId})
            }).bind(ctx).then(ctx.success).catch(ctx.error)
        }
    }
}
