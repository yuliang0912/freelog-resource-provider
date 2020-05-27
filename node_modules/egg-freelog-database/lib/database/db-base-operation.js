'use strict'

module.exports = class DbBaseOperation {

    constructor(dataBaseType) {
        this.dataBaseType = dataBaseType
    }

    /**
     * 创建实体
     */
    create() {
        throw new Error("This method must be overwritten!");
    }


    /**
     * 批量新增
     */
    insertMany() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 查询数量
     */
    count() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 获取单个实体
     */
    findOne() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 根据ID查找
     * @returns {*}
     */
    findById() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 获取多个
     */
    find() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 获取分页列表
     */
    findPageList() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 更新数据
     */
    update() {
        throw new Error("This method must be overwritten!");
    }

    /**
     * 删除单条
     */
    deleteOne() {

        throw new Error("This method must be overwritten!");
    }

    /**
     * 删除多条
     */
    deleteMany(condition) {
        throw new Error("This method must be overwritten!");
    }
}

