'use strict'

const Controller = require('egg').Controller;

module.exports = class CollectionController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.releaseProvider = app.dal.releaseProvider
        this.collectionProvider = app.dal.collectionProvider
    }

    /**
     * 创建资源收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const releaseId = ctx.checkBody('releaseId').isMongoObjectId().value

        ctx.validate()

        const {releaseName, resourceType, userId, username} = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        await this.collectionProvider.createReleaseCollection({
            releaseId, releaseName, resourceType, authorId: userId, authorName: username, userId: ctx.request.userId
        }).then(ctx.success)
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
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().value
        ctx.validate()

        let condition = {userId: ctx.request.userId}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (keywords) {
            condition.resourceName = new RegExp(keywords)
        }

        const totalItem = await this.collectionProvider.count(condition)
        const result = {page, pageSize, totalItem, dataList: []}
        if (totalItem <= (page - 1) * pageSize) {
            return ctx.success(result)
        }

        const collectionReleaseMap = await this.collectionProvider.findPageList(condition, page, pageSize, null, {updateDate: 1})
            .map(x => [x.releaseId, x]).then(list => new Map(list))

        await this.releaseProvider.find({_id: {$in: Array.from(collectionReleaseMap.keys())}}).then(dataList => {
            result.dataList = dataList.map(releaseInfo => {
                let {releaseId, releaseName, resourceType, userId, username, latestVersion} = releaseInfo
                let collectionReleaseInfo = collectionReleaseMap.get(releaseId)
                return {
                    releaseId, releaseName, resourceType, authorId: userId, authorName: username, latestVersion,
                    createDate: collectionReleaseInfo.createDate,
                    updateDate: collectionReleaseInfo.updateDate,
                }
            })
        })

        ctx.success(result)
    }


    /**
     * 批量查看发行是否被收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async isCollection(ctx) {

        const releaseIds = ctx.checkQuery('releaseIds').optional().isSplitMongoObjectId().toSplitArray().value
        ctx.validate()

        const condition = {
            userId: ctx.request.userId,
            releaseId: {$in: releaseIds}
        }

        const collectionSet = await this.collectionProvider.find(condition, 'releaseId').then(list => new Set(list.map(x => x.releaseId)))

        const result = releaseIds.map(x => Object({releaseId: x, isCollection: collectionSet.has(x)}))

        ctx.success(result)
    }

    /**
     * 查看收藏的资源详情
     * @param ctx
     * @returns {Promise<void>}
     */
    async show(ctx) {

        const releaseId = ctx.checkParams('id').isMongoObjectId().value
        ctx.validate()

        await this.collectionProvider.findOne({
            releaseId,
            userId: ctx.request.userId
        }).then(ctx.success).catch(ctx.error)
    }

    /**
     * 删除收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const releaseId = ctx.checkParams('id').isMongoObjectId().value
        ctx.validate()

        await this.collectionProvider.deleteOne({
            releaseId,
            userId: ctx.request.userId
        }).then(ret => ctx.success(ret.ok > 0))
    }
}