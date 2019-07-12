'use strict'

const Controller = require('egg').Controller;

module.exports = class CollectionController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.releaseProvider = app.dal.releaseProvider
        this.collectionProvider = app.dal.collectionProvider
    }

    /**
     * 资源收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const releaseId = ctx.checkBody('releaseId').isMongoObjectId().value

        ctx.validate()

        const {releaseName, resourceType, latestVersion, userId, username} = await this.releaseProvider.findById(releaseId).tap(model => ctx.entityNullObjectCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'releaseId'),
            data: {releaseId}
        }))

        await this.collectionProvider.createReleaseCollection({
            releaseId, releaseName, resourceType,
            version: latestVersion.version,
            authorId: userId,
            authorName: username,
            userId: ctx.request.userId
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

        const collectionReleases = await this.collectionProvider.findPageList(condition, page, pageSize, null, {createDate: -1})
        const releaseMap = await this.releaseProvider.find({_id: {$in: collectionReleases.map(x => x.releaseId)}})
            .then(dataList => new Map(dataList.map(x => [x.releaseId, x])))

        result.dataList = collectionReleases.map(collectionInfo => {
            let {releaseId, createDate} = collectionInfo
            let {releaseName, resourceType, policies, userId, username, latestVersion, updateDate, status} = releaseMap.get(releaseId)
            return {
                releaseId, releaseName, resourceType, policies, latestVersion,
                authorId: userId,
                authorName: username,
                collectionDate: createDate,
                releaseStatus: status,
                releaseUpdateDate: updateDate,
            }
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