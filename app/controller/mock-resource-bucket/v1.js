'use strict'

const Controller = require('egg').Controller

module.exports = class DraftResourceBucketController extends Controller {

    constructor({app}) {
        super(...arguments)
        this.mockResourceProvider = app.dal.mockResourceProvider
        this.mockResourceBucketProvider = app.dal.mockResourceBucketProvider
    }

    /**
     * bucket列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async index(ctx) {

        ctx.validate()
        await this.mockResourceBucketProvider.find({userId: ctx.request.userId}).then(ctx.success)

    }

    /**
     * 创建bucket
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        //只允许小写字母、数字、中划线（-），且不能以短横线开头或结尾
        const bucketName = ctx.checkBody('bucketName').exist().match(/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/).len(1, 63).value
        ctx.allowContentType({type: 'json'}).validate()

        const isExist = await this.mockResourceBucketProvider.count({bucketName})
        if (isExist) {
            ctx.error({msg: ctx.gettext('bucket-name-create-duplicate-error')})
        }

        await this.mockResourceBucketProvider.create({bucketName, userId: ctx.request.userId}).then(ctx.success)
    }


    /**
     * 删除bucket (业务上需要讨论bucket下挂载的resource怎么处理)
     * @param ctx
     * @returns {Promise<void>}
     */
    async destroy(ctx) {

        const bucketName = ctx.checkParams('id').match(/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/).len(1, 63).value
        ctx.validate()

        const bucketInfo = await this.mockResourceBucketProvider.findOne({bucketName}).tap(model => ctx.entityNullValueAndUserAuthorizationCheck(model, {
            msg: ctx.gettext('params-validate-failed', 'bucketName'),
            data: {bucketName}
        }))

        const isExistResource = await this.mockResourceProvider.findOne({bucketId: bucketInfo.id})
        if (isExistResource) {
            ctx.error({msg: ctx.gettext('bucket-delete-validate-error')})
        }

        await this.mockResourceBucketProvider.deleteOne({_id: bucketInfo.id}).tap(console.log).then(data => ctx.success(Boolean(data.n)))
    }

    /**
     * bucketName是否已存在
     * @param ctx
     * @returns {Promise<void>}
     */
    async isExistBucketName(ctx) {

        const bucketName = ctx.checkQuery('bucketName').exist().match(/^([a-z0-9]+[a-z0-9-]+[a-z0-9]+){1,63}$/).value
        ctx.validate()

        await this.mockResourceBucketProvider.count({bucketName}).then(data => ctx.success(Boolean(data)))
    }
}