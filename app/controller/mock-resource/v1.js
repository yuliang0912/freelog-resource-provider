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
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value
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
            dataList = await this.mockResourceProvider.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})
        }

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 详情
     * @param ctx
     */
    async show(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        ctx.validate()

        await this.mockResourceProvider.findById(mockId).then(ctx.success)
    }


    /**
     * 创建草稿资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const bucketName = ctx.checkBody('bucketName').exist().type('string').trim().value
        const name = ctx.checkBody('name').exist().type('string').trim().len(1, 100).value
        const uploadFileId = ctx.checkBody('uploadFileId').exist().isMongoObjectId().value
        const meta = ctx.checkBody('meta').optional().default({}).isObject().value
        const description = ctx.checkBody('description').optional().type('string').value
        const previewImages = ctx.checkBody('previewImages').optional().isArray().len(1, 1).default([]).value
        const dependencies = ctx.checkBody('dependencies').optional().isArray().len(0, 100).default([]).value
        ctx.validate()

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
        const resourceType = ctx.checkBody('resourceType').optional().isResourceType().toLowercase().value
        ctx.validate()

        if ([meta, description, uploadFileId, previewImages, dependencies, resourceType].every(x => x === undefined)) {
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
            mockResourceInfo, uploadFileId, meta, description, previewImages, dependencies, resourceType
        }).then(ctx.success)
    }


    /**
     * 删除mock资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const mockId = ctx.checkParams('id').exist().isMongoObjectId().value
        ctx.validate()

        const mockResourceInfo = await this.mockResourceProvider.findById(mockId).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'mockId'),
            data: {mockId}
        }))

        await ctx.service.mockResourceService.deleteMockResource(mockResourceInfo).then(ctx.success)
    }


    /**
     * mock-name是否在当前bucket已经存在
     * @param ctx
     * @returns {Promise<void>}
     */
    async isExistMockName(ctx) {

        const name = ctx.checkQuery('name').exist().value
        const bucketName = ctx.checkQuery('bucketName').exist().type('string').trim().value
        ctx.validate()

        await this.mockResourceProvider.findOne({name, bucketName}, '_id').then(data => ctx.success(Boolean(data)))
    }

    /**
     * 下载资源
     * @param ctx
     * @returns {Promise<void>}
     */
    async download(ctx) {

        const mockResourceId = ctx.checkParams('mockResourceId').exist().isMongoObjectId().value
        ctx.validate()

        const mockResourceInfo = await this.mockResourceProvider.findOne({mockResourceId}).tap(mockResourceInfo => ctx.entityNullValueAndUserAuthorizationCheck(mockResourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'mockResourceId'),
            data: {mockResourceId}
        }))

        const {fileOss, systemMeta, name} = mockResourceInfo
        await this.client.getStream(fileOss.objectKey).then(result => {
            ctx.status = result.res.status
            ctx.attachment(fileOss.filename || name)
            ctx.set('content-type', systemMeta.mimeType)
            ctx.body = result.stream
        })
    }
}