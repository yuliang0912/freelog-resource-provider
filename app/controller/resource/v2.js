'use strict'

const Controller = require('egg').Controller

class ResourcesController extends Controller {

    /**
     * 创建资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const stream = await ctx.getFileStream()
        ctx.request.body = stream.fields

        let meta = ctx.checkBody('meta').toJson().value
        let parentId = ctx.checkBody('parentId').default('').value
        let resourceName = ctx.checkBody('resourceName').optional().len(4, 60).value
        let resourceType = ctx.checkBody('resourceType').isResourceType().value

        if (!stream || !stream.filename) {
            ctx.errors.push({file: 'Can\'t found upload file'})
        }

        if (parentId !== '' && !ctx.helper.commonRegex.resourceId.test(parentId)) {
            ctx.errors.push({parentId: 'parentId格式错误'})
        }

        ctx.allowContentType({type: 'multipart', msg: '资源创建只能接受multipart类型的表单数据'}).validate()

        if (parentId) {
            let parentResource = await ctx.dal.resourceProvider.getResourceInfo({resourceId: parentId}).bind(ctx).catch(ctx.error)
            if (!parentResource || parentResource.userId !== ctx.request.userId) {
                ctx.error({msg: 'parentId错误,或者没有权限引用'})
            }
        }

        await ctx.service.resourceService.createResource({resourceName, resourceType, parentId, meta, stream})
    }
}

module.exports = ResourcesController
