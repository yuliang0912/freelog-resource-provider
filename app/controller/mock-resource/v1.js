'use strict'

const lodash = require('lodash')
const Controller = require('egg').Controller
const {ArgumentError} = require('egg-freelog-base/error')

module.exports = class MockResourceController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
    }

    /**
     * mock资源列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async index(ctx) {

        const page = ctx.checkQuery("page").optional().default(1).gt(0).toInt().value
        const pageSize = ctx.checkQuery("pageSize").optional().default(10).gt(0).lt(101).toInt().value
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().toLow().value
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().value
        const bucketName = ctx.checkQuery("bucketName").optional().type("string").value
        ctx.validate(true)

        const condition = {userId: ctx.request.userId}
        if (bucketName !== undefined) {
            condition.bucketName = bucketName
        }
        if (resourceType) {
            condition.resourceType = resourceType
        }
        if (keywords) {
            condition.$or = [{name: {$regex: keywords, $options: 'i'}}, {bucketName: {$regex: keywords, $options: 'i'}}]
        }

        var dataList = []
        const totalItem = await this.mockResourceProvider.count(condition)
        if (totalItem > (page - 1) * pageSize) {
            dataList = await this.mockResourceProvider.findPageList(condition, page, pageSize, null, {createDate: -1})
        }

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 详情
     * @param ctx
     */
    async show(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value

        ctx.validate(true)

        await this.mockResourceProvider.findById(mockId).then(ctx.success)
    }


    /**
     * 创建草稿资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const name = ctx.checkBody('name').exist().len(1, 100).value
        const meta = ctx.checkBody('meta').optional().default({}).isObject().value
        const bucketName = ctx.checkBody('bucketName').exist().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).default([]).value
        const uploadFileId = ctx.checkBody('uploadFileId').exist().isMongoObjectId(ctx.gettext('params-format-validate-failed', 'uploadFileId')).value

        ctx.allowContentType({type: 'json'}).validate()

        if (previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        await ctx.service.mockResourceService.createMockResource({
            name, uploadFileId, meta, description, previewImages, dependencies, bucketName
        }).then(ctx.success)
    }

    /**
     * 更新mock资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async update(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        const meta = ctx.checkBody('meta').optional().isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).value
        const uploadFileId = ctx.checkBody('uploadFileId').optional().isMongoObjectId(ctx.gettext('params-format-validate-failed', 'uploadFileId')).value

        ctx.allowContentType({type: 'json'}).validate()

        if ([meta, description, uploadFileId, previewImages, dependencies].every(x => x === undefined)) {
            ctx.error({msg: ctx.gettext('params-required-validate-failed')})
        }
        if (previewImages && previewImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'previewImages'))
        }

        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('mock-resource-entity-not-found'),
            data: {mockId}
        }))

        await ctx.service.mockResourceService.updateMockResource({
            mockResourceInfo, uploadFileId, meta, description, previewImages, dependencies
        }).then(ctx.success)
    }


    /**
     * 删除mock资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        ctx.validate(true)

        await ctx.service.mockResourceService.deleteMockResource(mockId).then(ctx.success)
    }


    /**
     * mock-name是否在当前bucket已经存在
     * @param ctx
     * @returns {Promise<void>}
     */
    async isExistMockName(ctx) {

        const name = ctx.checkQuery('name').exist().value
        const bucketId = ctx.checkBody('bucketId').exist().isMongoObjectId(ctx.gettext('params-format-validate-failed', 'bucketId')).value
        ctx.validate()

        await this.mockResourceProvider.findById({name, bucketId}, '_id').then(data => ctx.success(Boolean(data)))
    }
}