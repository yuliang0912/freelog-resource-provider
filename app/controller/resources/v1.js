/**
 * Created by yuliang on 2017/6/30.
 */


module.exports = app => {
    return class ResourcesController extends app.Controller {

        /**
         * 资源列表展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async index(ctx) {
            ctx.error('this is index')
        }

        /**
         * 单个资源展示
         * @param ctx
         * @returns {Promise.<void>}
         */
        async show(ctx) {
            let resourceInfo = await ctx.service.resourceService.getResourceInfo({resourceId: 'a1'})
            ctx.success(resourceInfo)
        }

        async edit(ctx) {
            ctx.success('this is edit action')
        }

        async create(ctx) {
            ctx.success('this is create action')
        }

        async update(ctx) {
            ctx.success('this is update action')
        }

        async destroy(ctx) {
            ctx.success('this is destroy action')
        }
    }
}