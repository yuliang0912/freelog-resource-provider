/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

const sendToWormhole = require('stream-wormhole');
const upload = require('../../extend/upload/upload_factory')
const fileBodyParse = require('../../extend/tools/file_body_parse')

module.exports = app => {
    return class ResourcesController extends app.Controller {

        /**
         * 资源列表展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async index(ctx) {
            let page = ctx.checkQuery("page").default(1).gt(0).toInt().value
            let pageSize = ctx.checkQuery("pageSize").default(1).gt(0).toInt().value
            let condition = {
                userId: ctx.request.userId
            }

            await ctx.validate().service.resourceService
                .getResourceList(condition, page, pageSize).bind(ctx)
                .then(ctx.success)
                .catch(ctx.error)
        }

        /**
         * 单个资源展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async show(ctx) {
            let resourceIdMatch = new RegExp(`^([0-9a-zA-Z]{40})+(.${ctx.app.resourceAttribute.allAttributes.join('|.')}){0,1}$`)
            let resourceMatch = ctx.checkParams("id").match(resourceIdMatch, 'id格式匹配错误').value
            ctx.validate()

            let resourceId = resourceMatch.split('.')[0]
            let attribute = resourceMatch.split('.')[1]
            let resourceInfo = await ctx.validate().service.resourceService.getResourceInfo({resourceId}).bind(ctx).catch(ctx.error)


            let test = await ctx.app.mongo.relation.find()

            console.log(test)


            if (!attribute || !resourceInfo || resourceInfo.mimeType !== 'application/json') {
                return ctx.success(resourceInfo)
            }

            let content = await ctx.curl(resourceInfo.resourceUrl)

            ctx.success(JSON.parse(content.data.toString())[attribute])

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
            let resourceId = ctx.checkParams("id").match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            ctx.validate()

            await ctx.service.resourceService
                .getResourceInfo({resourceId})
                .then(data => ctx.success(data))
        }

        /**
         * 创建资源
         * @param ctx fileStream WIKI: https://eggjs.org/zh-cn/basics/controller.html
         * @returns {Promise.<void>}
         */
        async create(ctx) {
            if (!ctx.is("multipart")) {
                ctx.error('资源创建只能接受multipart类型的表单数据')
            }

            const stream = await ctx.getFileStream()
            ctx.request.body = stream.fields

            let meta = ctx.checkBody('meta').toJson().value
            let resourceName = ctx.checkBody('resourceName').default('').len(0, 100).value
            let resourceType = ctx.checkBody('resourceType').in(ctx.app.resourceType.ArrayList).value

            if (!stream || !stream.filename) {
                ctx.errors.push({file: 'Can\'t found upload file'})
            }

            ctx.validate()

            let fileName = ctx.helper.uuid.v4().replace(/-/g, '')
            let fileSha1Async = ctx.helper.fileSha1Helper.getFileMetaByStream(stream)
            let fileUploadAsync = upload(ctx.app.config.uploadConfig).putStream(stream, resourceType, fileName)

            const resourceInfo = await Promise.all([fileSha1Async, fileUploadAsync]).spread((fileMeta, uploadData) => {
                return {
                    resourceId: fileMeta.sha1,
                    status: ctx.app.resourceStatus.NORMAL,
                    resourceType,
                    meta: JSON.stringify(Object.assign(meta, fileMeta)),
                    resourceUrl: uploadData.url,
                    userId: ctx.request.userId,
                    resourceName: resourceName === '' ? ctx.helper.stringExpand.cutString(fileMeta.sha1, 10) : resourceName,
                    mimeType: fileMeta.mimeType
                }
            }).catch(err => {
                sendToWormhole(stream)
                ctx.error(err)
            })

            await ctx.service.resourceService.exists({resourceId: resourceInfo.resourceId}).then(existsResource => {
                existsResource && ctx.error('资源已经被创建,不能创建重复的资源')
            })

            await ctx.service.resourceService.createResource(resourceInfo).bind(ctx)
                .then(data => {
                    resourceInfo.meta = JSON.parse(resourceInfo.meta)
                    ctx.success(resourceInfo)
                }).catch(ctx.error)
        }

        /**
         * 更新资源
         * @param ctx
         * @returns {Promise.<void>}
         *
         */
        async update(ctx) {

            ctx.error('资源不接受更新操作')
            //
            // if (!ctx.is("multipart")) {
            //     ctx.error('资源创建只能接受multipart类型的表单数据')
            // }
            //
            // const stream = await ctx.getFileStream()
            // ctx.request.body = stream.fields
            //
            // let resourceId = ctx.checkParams("id").match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            // let meta = ctx.checkBody('meta').toJson().value
            // let resourceName = ctx.checkBody('resourceName').default('').len(0, 100).value
            // let status = ctx.checkBody('status').default(1).in([1, 2]).value
            //
            // ctx.validate()
            //
            // let resourceInfo = await ctx.service.resourceService.getResourceInfo({resourceId})
            //
            // if (!resourceInfo) {
            //     ctx.error('未找到资源')
            // }
            //
            // if (resourceInfo.status === ctx.app.resourceStatus.RELEASE) {
            //
            // }
        }

        /**
         * 删除资源
         * @param ctx
         * @returns {Promise.<void>}
         */
        async destroy(ctx) {
            let resourceId = ctx.checkParams("id").match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value
            ctx.validate()

            let condition = {
                resourceId, userId: 1
            }

            await ctx.service.resourceService
                .updateResource({status: ctx.app.resourceStatus.DELETE}, condition).bind(ctx)
                .then(ctx.success)
                .catch(ctx.error)
        }
    }
}