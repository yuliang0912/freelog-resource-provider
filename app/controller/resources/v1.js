/**
 * Created by yuliang on 2017/6/30.
 * 资源相关操作restful-controller
 */

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
            ctx.validate()

            let condition = {
                userId: 1
            }
            await ctx.service.resourceService.getResourceList(condition, page, pageSize)
                .then((data) => ctx.success(data)).catch(err => ctx.error(err))
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

        /**
         * 编辑资源
         * @param ctx
         * @returns {Promise.<void>}
         */
        async edit(ctx) {
            ctx.success('this is edit action')
        }

        /**
         * 创建资源
         * @param ctx
         * @returns {Promise.<void>}
         */
        async create(ctx) {
            ctx.success('this is create action')
        }

        /**
         * 更新资源
         * @param ctx
         * @returns {Promise.<void>}
         */
        async update(ctx) {
            ctx.success('this is update action')
        }

        /**
         * 删除资源
         * @param ctx
         * @returns {Promise.<void>}
         */
        async destroy(ctx) {
            ctx.success('this is destroy action')
        }
    }
}