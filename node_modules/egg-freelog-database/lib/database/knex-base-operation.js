'use strict'

const type = require('is-type-of')
const DbBaseOperation = require('./db-base-operation')

module.exports = class KnexBaseOperation extends DbBaseOperation {

    constructor(baseBuilder, primaryKey = null) {
        super('knex')
        this.primaryKey = primaryKey
        this.baseBuilder = baseBuilder
    }

    /**
     * 获取类型校验模块
     * @returns {*}
     */
    get type() {
        return type
    }

    /**
     * 获取查询链
     * @returns {MediaStream | Response | MediaStreamTrack | Request}
     */
    get queryChain() {
        return this.baseBuilder.clone()
    }

    /**
     * 创建实体
     * @param model
     */
    create(model) {

        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        return this.queryChain.insert(model)
    }


    /**
     * 批量新增
     * @param models
     */
    insertMany(models) {

        if (!Array.isArray(models)) {
            return Promise.reject(new Error("models must be array"))
        }

        if (models.length < 1) {
            return Promise.resolve([])
        }

        return this.queryChain.insert(models)
    }

    /**
     * 查询数量
     * @param condition
     */
    count(condition, column) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.queryChain.where(condition).count(`${column || "*"} as count`).first().then(data => {
            return data ? parseInt(data.count) : 0
        })
    }

    /**
     * 获取单个实体
     * @param condition
     * @returns {*}
     */
    findOne(where, columns) {
        let query = this.queryChain
        if (where) {
            query.where(where)
        }
        return query.select(columns).first()
    }

    /**
     * 根据ID查找
     * @param args
     * @returns {*}
     */
    findById(id, columns) {
        if (!id) {
            return Promise.reject(new Error("id must be exist"))
        }
        if (!this.primaryKey) {
            return Promise.reject(new Error("primaryKey must be exist"))
        }
        return this.queryChain.where({[this.primaryKey]: id}).select(columns).first()
    }

    /**
     * 获取列表
     * @param condition
     * @returns {*}
     */
    find(where, columns) {

        let query = this.queryChain
        if (where) {
            query.where(where)
        }
        return query.select(columns)
    }

    /**
     * 获取分页列表
     * @param condition
     * @param page
     * @param pageSize
     * @param projection
     */
    findPageList({where, page, pageSize, columns = null, orderBy = null, asc = true}) {
        let query = this.queryChain
        if (where) {
            query.where(where)
        }
        if (pageSize) {
            query.limit(pageSize)
        }
        if (page && pageSize) {
            query.offset((page - 1) * pageSize)
        }
        if (orderBy) {
            query.orderBy(orderBy, asc ? "ASC" : "DESC")
        }
        return query.select(columns)
    }

    /**
     * 更新数据
     * @param model
     * @param condition
     * @returns {Promise<never>}
     */
    update(model, condition) {

        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.queryChain.where(condition).update(model)
    }

    /**
     * 删除数据
     * @param condition
     * @returns {Promise<never>}
     */
    deleteOne(condition) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.queryChain.where(condition).limit(1).delete()
    }

    /**
     * 删除多条
     * @param condition
     * @returns {*}
     */
    deleteMany(condition) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.queryChain.where(condition).delete()
    }
}