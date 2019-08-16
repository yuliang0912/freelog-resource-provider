'use strict'

const Controller = require('egg').Controller
const {LoginUser} = require('egg-freelog-base/app/enum/identity-type')

module.exports = class FileController extends Controller {

    /**
     * 上传资源文件
     * @returns {Promise<void>}
     */
    async uploadResourceFile(ctx) {

        const fileStream = await ctx.getFileStream()
        ctx.request.body = fileStream.fields
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().toLowercase().value

        ctx.allowContentType({
            type: 'multipart',
            msg: ctx.gettext('resource-form-enctype-validate-failed', 'multipart')
        }).validateVisitorIdentity(LoginUser)


        await ctx.service.temporaryUploadFileService.uploadResourceFile({fileStream, resourceType}).then(ctx.success)
    }

    /**
     * 上传预览图
     * @param ctx
     * @returns {Promise<void>}
     */
    async uploadPreviewImage(ctx) {

        const fileStream = await ctx.getFileStream()
        ctx.validateVisitorIdentity(LoginUser)

        //后期可以优化,先临时存储.等预览图被正式使用时,才复制到对应的oss目录.否则定期删除
        await ctx.service.temporaryUploadFileService.uploadPreviewImage(fileStream).then(ctx.success)
    }
}