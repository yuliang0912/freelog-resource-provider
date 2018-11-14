/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const KnexBaseOperation = require('egg-freelog-database/lib/database/knex-base-operation')

module.exports = class ResourceProvider extends KnexBaseOperation {

    constructor(app) {
        super(app.knex.resource('resources'), 'resourceId')
        this.app = app
        this.resourceKnex = app.knex.resource
    }

    /**
     * 根据资源ID批量获取资源
     * @param resourceIds
     * @returns {*|void}
     */
    getResourceByIdList(resourceIds) {
        if (!Array.isArray(resourceIds)) {
            return Promise.reject(new Error("resourceIds must be array"))
        }

        if (resourceIds.length < 1) {
            return Promise.resolve([])
        }

        return super.queryChain.whereIn('resourceId', resourceIds).orderBy('createDate', 'desc').select()
    }

    /**
     * 查询数量
     * @param condition
     * @returns {Promise.<void>}
     */
    getResourceCount(condition) {
        return super.count(condition)
    }


    /**
     * 创建资源信息
     * @param resource
     * @returns {Promise.<*>}
     */
    createResource(resource, parentId) {

        if (!super.type.object(resource)) {
            return Promise.reject(new Error("resource is not object"))
        }

        const {meta, systemMeta, previewImages} = resource

        resource = Object.assign({}, resource, {
            meta: JSON.stringify(meta),
            systemMeta: JSON.stringify(systemMeta),
            previewImages: JSON.stringify(previewImages)
        })

        return this.resourceKnex.transaction(trans => {

            const task1 = super.queryChain.transacting(trans).insert(resource)
            const task2 = this.resourceKnex.raw(`INSERT INTO respositories(resourceId,resourceName,lastVersion,userId,status,createDate) 
                 VALUES (:resourceId,:resourceName,:lastVersion,:userId,:status,:createDate) ON DUPLICATE KEY UPDATE lastVersion = :lastVersion`,
                {
                    resourceId: parentId || resource.resourceId,
                    resourceName: resource.resourceName,
                    lastVersion: resource.resourceId,
                    userId: resource.userId,
                    createDate: resource.createDate,
                    status: 1
                }).transacting(trans).then()

            return Promise.all([task1, task2]).then(trans.commit).catch(trans.rollback)
        })
    }

    /**
     * 获取单个资源信息
     * @param condition 查询条件
     * @returns {Promise.<*>}
     */
    getResourceInfo(condition) {
        return super.findOne(condition)
    }

    /**
     * 获取多个资源
     * @param condition 资源查找条件
     * @returns {Promise.<*>}
     */
    getResourceList(condition, page, pageSize) {
        return super.findPageList({where: condition, page, pageSize, orderBy: "createDate", asc: false})
    }

    /**
     * 编辑资源
     * @param model
     * @param condition
     * @returns {Promise.<*>}
     */
    updateResourceInfo(model, condition) {
        return super.update(model, condition)
    }

    /**
     * 获取资源仓储记录
     * @param condition
     */
    getRepositories(condition, page, pageSize) {

        if (!super.type.object(condition)) {
            return Promise.reject(new Error("getRepositories:condition must be object"))
        }

        return this.resourceKnex('respositories').where(condition)
            .limit(pageSize).offset((page - 1) * pageSize)
            .orderBy('createDate', 'desc')
            .select()
    }

    /**
     * 更新资源库
     * @param model
     * @param condition
     * @returns {*}
     */
    updateRespository(model, condition) {

        if (!super.type.object(model)) {
            return Promise.reject(new Error("model must be object"))
        }

        return this.resourceKnex('respositories').update(model).where(condition)
    }

    /**
     * 分页搜索资源库
     * @param condition
     * @param keyWords
     * @param page
     * @param pageSize
     */
    searchPageList(condition, keyWords, page, pageSize) {
        const baseQuery = super.queryChain
        if (condition) {
            baseQuery.where(condition)
        }
        baseQuery.where(function () {
            if (keyWords) {
                this.where('resourceName', 'like', `%${keyWords}%`).orWhere('resourceId', 'like', `%${keyWords}%`)
            }
            if (!condition.resourceType && keyWords) {
                this.orWhere('resourceType', 'like', `${keyWords}%`)
            }
        })

        const countTask = baseQuery.clone().count("* as count").first()
        const listTask = baseQuery.clone().select().orderBy("createDate", "desc")
        if (pageSize) {
            listTask.limit(pageSize)
        }
        if (page && pageSize) {
            listTask.offset((page - 1) * pageSize)
        }

        return Promise.all([countTask, listTask]).then(([count, list]) => new Object({
            totalItem: count.count ? parseInt(count.count) : 0,
            dataList: list
        }))
    }
}