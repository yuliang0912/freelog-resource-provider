'use strict'

const Controller = require('egg').Controller;

module.exports = class CollectionController extends Controller {

    /**
     * 创建资源收藏
     * @param ctx
     * @returns {Promise<void>}
     */
    async create(ctx) {

        const resourceId = ctx.checkBody('resourceId').isResourceId().value

        ctx.validate()
    }

    /**
     * 获取资源收藏列表
     * @param ctx
     * @returns {Promise<void>}
     */
    async index(ctx) {

    }
}