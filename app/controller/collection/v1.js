'use strict'

const lodash = require('lodash')
const Controller = require('egg').Controller;
const {LoginUser} = require('egg-freelog-base/app/enum/identity-type')

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
        ctx.validateParams().validateVisitorIdentity(LoginUser)

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
        const releaseStatus = ctx.checkQuery('releaseStatus').optional().toInt().in([0, 1, 2]).value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        let condition = {userId: ctx.request.userId}
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (lodash.isString(keywords) && keywords.length > 0) {
            let searchRegExp = new RegExp(keywords, "i")
            if (/^[0-9a-fA-F]{4,24}$/.test(keywords)) {
                condition.$or = [{releaseName: searchRegExp}, {releaseId: keywords.toLowerCase()}]
            } else {
                condition.releaseName = searchRegExp
            }
        }


        var releaseMatchAggregates = [{
            $match: {
                "releaseInfos.status": releaseStatus
            }
        }]
        var collectionMatchAggregates = [{
            $match: condition
        }]
        var joinReleaseAggregates = [
            {
                $addFields: {"release_id": {"$toObjectId": "$releaseId"}}
            }, {
                $lookup: {
                    from: "release-infos",
                    localField: "release_id",
                    foreignField: "_id",
                    as: "releaseInfos"
                }
            }]
        var countAggregates = [{$count: "totalItem"}]
        var pageAggregates = [{
            $skip: (page - 1) * pageSize
        }, {
            $limit: pageSize
        }]

        var countAggregatePipelines = [], resultAggregatePipelines = []
        if ([0, 1].includes(releaseStatus)) {
            countAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, releaseMatchAggregates, countAggregates
            ])
            resultAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, releaseMatchAggregates, pageAggregates
            ])
        } else {
            countAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, countAggregates
            ])
            resultAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, pageAggregates, joinReleaseAggregates
            ])
        }

        const [totalItemInfo] = await this.collectionProvider.aggregate(countAggregatePipelines)

        let {totalItem = 0} = totalItemInfo || {}
        const result = {page, pageSize, totalItem, dataList: []}
        if (totalItem <= (page - 1) * pageSize) {
            ctx.success(result)
            return
        }

        result.dataList = await this.collectionProvider.aggregate(resultAggregatePipelines).map(model => {
            let {releaseId, createDate, releaseInfos = []} = model
            let {releaseName, resourceType, policies, userId, username, previewImages, resourceVersions, latestVersion, updateDate, status} = releaseInfos.length ? releaseInfos[0] : {}
            return {
                releaseId, releaseName, resourceType, policies, latestVersion, previewImages, resourceVersions,
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
     * 聚合查询
     * @param collectionCondition
     * @param releaseStatus
     * @param page
     * @param pageSize
     * @returns {Promise<{page: *, pageSize: *, totalItem: number, dataList: Array}>}
     * @private
     */
    async _aggregateReleaseInfoSearch(collectionCondition, releaseStatus, page, pageSize) {

        var releaseMatchAggregates = [{
            $match: {
                "releaseInfos.status": releaseStatus
            }
        }]
        var collectionMatchAggregates = [{
            $match: collectionCondition
        }]
        var joinReleaseAggregates = [
            {
                $addFields: {"release_id": {"$toObjectId": "$releaseId"}}
            }, {
                $lookup: {
                    from: "release-infos",
                    localField: "release_id",
                    foreignField: "_id",
                    as: "releaseInfos"
                }
            }]
        var countAggregates = [{$count: "totalItem"}]
        var pageAggregates = [{
            $skip: (page - 1) * pageSize
        }, {
            $limit: pageSize
        }]

        var countAggregatePipelines = [], resultAggregatePipelines = []
        if ([0, 1].includes(releaseStatus)) {
            countAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, releaseMatchAggregates, countAggregates
            ])
            resultAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, releaseMatchAggregates, pageAggregates
            ])
        } else {
            countAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, joinReleaseAggregates, countAggregates
            ])
            resultAggregatePipelines = lodash.flatten([
                collectionMatchAggregates, pageAggregates, joinReleaseAggregates
            ])
        }

        const [totalItemInfo] = await this.collectionProvider.aggregate(countAggregatePipelines).tap(console.log)

        let {totalItem = 0} = totalItemInfo || {}
        const result = {page, pageSize, totalItem, dataList: []}
        if (totalItem <= (page - 1) * pageSize) {
            return result
        }

        result.dataList = await this.collectionProvider.aggregate(resultAggregatePipelines).tap(console.log)

        return result
    }

    /**
     * 批量查看发行是否被收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async isCollection(ctx) {

        const releaseIds = ctx.checkQuery('releaseIds').optional().isSplitMongoObjectId().toSplitArray().value
        ctx.validateParams().validateVisitorIdentity(LoginUser)

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
        ctx.validateParams().validateVisitorIdentity(LoginUser)

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
        ctx.validateParams().validateVisitorIdentity(LoginUser)

        await this.collectionProvider.deleteOne({
            releaseId,
            userId: ctx.request.userId
        }).then(ret => ctx.success(ret.ok > 0))
    }
}