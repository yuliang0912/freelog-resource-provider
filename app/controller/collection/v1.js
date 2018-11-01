'use strict'

const Controller = require('egg').Controller;

module.exports = class CollectionController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.resourceProvider = app.dal.resourceProvider
        this.collectionProvider = app.dal.collectionProvider
    }

    /**
     * 创建资源收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const resourceId = ctx.checkBody('resourceId').isResourceId().value

        ctx.validate()

        const resourceInfo = await this.resourceProvider.getResourceInfo({resourceId})
        if (!resourceInfo) {
            ctx.error({msg: `resourceId:${resourceId}错误,未能找到有效资源`})
        }

        await this.collectionProvider.createResourceCollection({
            resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            authorId: resourceInfo.userId,
            authorName: resourceInfo.userName,
            userId: ctx.request.userId
        }).then(ctx.success).catch(ctx.error)
    }

    /**
     * 获取资源收藏列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery("page").default(1).gt(0).toInt().value
        const pageSize = ctx.checkQuery("pageSize").default(10).gt(0).lt(101).toInt().value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value
        const keyWords = ctx.checkQuery("keyWords").optional().decodeURIComponent().value
        ctx.validate()

        let condition = {status: 0, userId: ctx.request.userId}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (keyWords) {
            condition.resourceName = new RegExp(keyWords)
        }

        const totalItem = await this.collectionProvider.count(condition)
        const result = {page, pageSize, totalItem, dataList: []}
        if (totalItem <= (page - 1) * pageSize) {
            return ctx.success(result)
        }

        const collectionResources = await this.collectionProvider.findPageList(condition, page, pageSize, null, {createDate: 1})
            .map(x => [x.resourceId, x]).then(list => new Map(list))

        await this.resourceProvider.getResourceByIdList(Array.from(collectionResources.keys())).then(dataList => {
            dataList.forEach(item => item.collectionDate = collectionResources.get(item.resourceId).createDate)
            result.dataList = dataList
        })

        ctx.success(result)
    }

    /**
     * 查看收藏的资源详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async show(ctx) {

        const resourceId = ctx.checkParams('id').isResourceId().value
        ctx.validate()

        await this.collectionProvider.findOne({resourceId, status: 0}).then(ctx.success).catch(ctx.error)
    }

    /**
     * 删除收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const resourceId = ctx.checkParams('id').isResourceId().value
        ctx.validate()

        await this.collectionProvider.updateOne({resourceId, userId: ctx.request.userId}, {status: 1})
            .then(ret => ctx.success(ret.nModified > 0)).catch(ctx.error)
    }
}