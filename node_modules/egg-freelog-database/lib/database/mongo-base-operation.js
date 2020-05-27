'use strict'

const type = require('is-type-of')
const DbBaseOperation = require('./db-base-operation')

module.exports = class MongoBaseOperation extends DbBaseOperation {

    constructor(schemaModel) {
        super('mongoose')
        this.schemaModel = schemaModel
    }

    /**
     *当前mongo操作实体
     * @returns {*}
     */
    get model() {
        return this.schemaModel
    }


    /**
     * 获取类型校验模块
     * @returns {*}
     */
    get type() {
        return type
    }

    /**
     * 聚合查询
     * @param args
     * @returns {*}
     */
    aggregate(...args) {
        return this.schemaModel.aggregate(...args).exec()
    }

    /**
     * 创建实体
     * @param model
     */
    create(model, ...args) {

        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        return this.schemaModel.create(model, ...args)
    }


    /**
     * 查找并更新
     * @param args
     * @returns {*}
     */
    findOneAndUpdate(condition, ...args) {
        if (type.nullOrUndefined(condition)) {
            return Promise.reject(new Error("condition must be object number or string"))
        }
        return this.schemaModel.findOneAndUpdate(condition, ...args)
    }


    /**
     * 批量新增
     * @param models
     */
    insertMany(models, ...args) {

        if (!Array.isArray(models)) {
            return Promise.reject(new Error("models must be array"))
        }

        if (models.length < 1) {
            return Promise.resolve([])
        }

        return this.schemaModel.insertMany(models, ...args)
    }

    /**
     * 查询数量
     * @param condition
     */
    count(condition) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.countDocuments(condition).exec()
    }

    /**
     * 获取单个实体
     * @param condition
     * @returns {*}
     */
    findOne(condition, ...args) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.findOne(condition, ...args).exec()
    }

    /**
     * 根据ID查找
     * @param condition
     * @param args
     * @returns {*}
     */
    findById(condition, ...args) {
        if (!condition) {
            return Promise.reject(new Error("condition must be exist"))
        }
        return this.schemaModel.findById(condition, ...args).exec()
    }

    /**
     * 获取列表
     * @param condition
     * @returns {*}
     */
    find(condition, ...args) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.find(condition, ...args).exec()
    }

    /**
     * 获取分页列表
     * @param condition
     * @param page
     * @param pageSize
     * @param projection
     */
    findPageList(condition, page, pageSize, projection = null, sort = null) {

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        let options = {sort}
        if (type.int32(page) && type.int32(pageSize)) {
            if (page < 1 || pageSize < 1) {
                return Promise.reject(new Error("参数page和pageSize必须大于0"))
            }
            options.skip = (page - 1) * pageSize
            options.limit = pageSize
        } else if (type.int32(pageSize)) {
            options.limit = pageSize
        }

        return this.schemaModel.find(condition, projection, options).exec()
    }

    /**
     * 更新数据
     * @param model
     * @param condition
     * @returns {Promise<never>}
     */
    update(condition, model, ...args) {

        console.warn("update函数已过时,modelName:" + this.schemaModel.modelName)

        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.update(condition, model, ...args).exec()
    }

    /**
     * 更新一条数据
     * @param condition
     * @param model
     * @param args
     * @returns {*}
     */
    updateOne(condition, model, ...args) {

        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.updateOne(condition, model, ...args).exec()
    }

    /**
     * 更新多条数据
     * @param condition
     * @param model
     * @param args
     * @returns {*}
     */
    updateMany(condition, model, ...args) {
        if (!type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        if (!type.object(condition)) {
            return Promise.reject(new Error("condition must be object"))
        }

        return this.schemaModel.updateMany(condition, model, ...args).exec()
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

        return this.schemaModel.deleteOne(condition).exec()
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

        return this.schemaModel.deleteMany(condition).exec()
    }
}