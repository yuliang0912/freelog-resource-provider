/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

const sendToWormhole = require('stream-wormhole');
const fileBodyParse = require('../../extend/tools/file_body_parse')
const upload = require('../../extend/upload/upload_factory')

module.exports = app => {
    return class ResourcesController extends app.Controller {

        /**
         * 资源列表展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async index(ctx) {
            let page = ctx.checkQuery("page").default(1).toInt().value
            let pageSize = ctx.checkQuery("pageSize").default(1).toInt().value
            let condition = {
                userId: 1
            }

            await ctx.validate().service.resourceService
                .getResourceList(condition, page, pageSize)
                .then((data) => ctx.success(data))
                .catch(err => ctx.error(err))
        }

        /**
         * 单个资源展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async show(ctx) {

            let resourceId = ctx.checkParams("id").match(/^[0-9a-zA-Z]{40}$/, 'id格式错误').value

            await ctx.validate().service.resourceService
                .getResourceInfo({resourceId})
                .then(data => ctx.success(data))
                .catch(err => ctx.error(err))
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
            const stream = await ctx.getFileStream();
            ctx.request.body = stream.fields

            let meta = ctx.checkBody('meta').toJson().value
            let resourceName = ctx.checkBody('resourceName').default('').len(0, 100).value
            let resourceType = ctx.checkBody('resourceType').in(ctx.app.resourceType.ArrayList).value
            let status = ctx.checkBody('status').in([1, 2, 3]).value

            if (!stream || !stream.filename) {
                ctx.errors.push({file: 'Can\'t found upload file'})
            }
            ctx.validate()

            let fileSha1Async = ctx.helper.fileSha1Helper.getFileSha1ByStream(stream)
            let fileUploadAsync = upload(ctx.app.config.uploadConfig).putStream(stream, resourceType, stream.filename)

            const resourceInfo = await Promise.all([fileSha1Async, fileUploadAsync]).spread((fileSha1, file) => {
                return {
                    resourceId: fileSha1,
                    resourceType,
                    meta, status,
                    resourceUrl: file.url,
                    userId: 1,
                    resourceName: resourceName === '' ? stream.filename : resourceName,
                    mimeType: stream.mimetype
                }
            }).catch(err => {
                sendToWormhole(stream)
                ctx.error(err)
            })

            ctx.success(resourceInfo)
        }

        /**
         * 更新资源
         * @param ctx
         * @returns {Promise.<void>}
         *
         */
        async update(ctx) {
            ctx.error("资源不接受更新")
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
                .updateResource({status: ctx.app.resourceStatus.DELETE}, condition)
                .then(data => ctx.success(data))
                .catch(err => ctx.error(err))
        }
    }
}