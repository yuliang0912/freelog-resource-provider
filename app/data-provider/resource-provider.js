/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const moment = require('moment')

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

        return super.queryChain.whereIn('resourceId', resourceIds).select()
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

        return this.resourceKnex.transaction(trans => {
            let task1 = super.queryChain.transacting(trans).insert(resource)
            let task2 = this.resourceKnex.raw(`INSERT INTO respositories(resourceId,resourceName,lastVersion,userId,status,createDate) 
                 VALUES (:resourceId,:resourceName,:lastVersion,:userId,:status,:createDate) ON DUPLICATE KEY UPDATE lastVersion = :lastVersion`,
                {
                    resourceId: parentId ? parentId : resource.resourceId,
                    resourceName: resource.resourceName,
                    lastVersion: resource.resourceId,
                    userId: resource.userId,
                    createDate: moment().toDate(),
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
    getRespositories(condition, page, pageSize) {

        if (!super.type.object(condition)) {
            return Promise.reject(new Error("getRespositories:condition must be object"))
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
}

// module.exports = app => {
//
//     let {type, knex} = app
//
//     return {
//
//         /**
//          *根据资源ID获取资源信息
//          * @param resourceIds
//          * @returns {*|void}
//          */
//         getResourceByIds(resourceIds) {
//             return knex.resource('resources').whereIn('resourceId', resourceIds).select()
//         },
//
//         /**
//          * 资源是否存在
//          * @param condition
//          * @returns {Promise.<void>}
//          */
//         count(condition) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition is not object"))
//             }
//
//             return knex.resource('resources').where(condition).count('* as count').first()
//         },
//
//
//         /**
//          * 创建资源信息
//          * @param resource
//          * @returns {Promise.<*>}
//          */
//         createResource(resource, parentId) {
//
//             if (!type.object(resource)) {
//                 return Promise.reject(new Error("resource is not object"))
//             }
//
//             return knex.resource.transaction(trans => {
//                 let task1 = knex.resource('resources').transacting(trans).insert(resource)
//                 let task2 = knex.resource.raw(`INSERT INTO respositories(resourceId,resourceName,lastVersion,userId,status,createDate)
//                  VALUES (:resourceId,:resourceName,:lastVersion,:userId,:status,:createDate) ON DUPLICATE KEY UPDATE lastVersion = :lastVersion`,
//                     {
//                         resourceId: parentId ? parentId : resource.resourceId,
//                         resourceName: resource.resourceName,
//                         lastVersion: resource.resourceId,
//                         userId: resource.userId,
//                         createDate: moment().toDate(),
//                         status: 1
//                     }).transacting(trans).then()
//
//                 return Promise.all([task1, task2]).then(trans.commit).catch(trans.rollback)
//             })
//         },
//
//
//         /**
//          * 获取单个资源信息
//          * @param condition 查询条件
//          * @returns {Promise.<*>}
//          */
//         getResourceInfo(condition) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('resources').where(condition).first()
//         },
//
//         /**
//          * 获取多个资源
//          * @param condition 资源查找条件
//          * @returns {Promise.<*>}
//          */
//         getResourceList(condition, page, pageSize) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('resources').where(condition)
//                 .limit(pageSize).offset((page - 1) * pageSize)
//                 .orderBy('createDate', 'desc')
//                 .select()
//         },
//
//         /**
//          * 根据主键ID集合批量获取资源
//          * @param resourceIdList
//          */
//         getResourceByIdList(resourceIdList) {
//
//             if (!Array.isArray(resourceIdList) || resourceIdList.length < 1) {
//                 return Promise.resolve([])
//             }
//
//             return knex.resource('resources').where('resourceId', 'in', resourceIdList)
//         },
//
//
//         /**
//          * 编辑资源
//          * @param model
//          * @param condition
//          * @returns {Promise.<*>}
//          */
//         updateResource(model, condition) {
//
//             if (!type.object(model)) {
//                 return Promise.reject(new Error("model must be object"))
//             }
//
//             return knex.resource('resources').update(model).where(condition)
//         },
//
//         /**
//          * 获取资源仓储记录
//          * @param condition
//          */
//         getRespositories(condition, page, pageSize) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('respositories').where(condition)
//                 .limit(pageSize).offset((page - 1) * pageSize)
//                 .orderBy('createDate', 'desc')
//                 .select()
//         },
//
//         /**
//          * 更新资源库
//          * @param model
//          * @param condition
//          * @returns {*}
//          */
//         updateRespository(model, condition) {
//
//             if (!type.object(model)) {
//                 return Promise.reject(new Error("model must be object"))
//             }
//
//             return knex.resource('respositories').update(model).where(condition)
//         },
//
//         /**
//          * 获取资源数量
//          * @param condition
//          * @returns {*}
//          */
//         getResourceCount(condition) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('resources').where(condition).count("resourceId as count").first()
//         },
//
//         /**
//          * 获取数量
//          * @param condition
//          * @returns {*}
//          */
//         getCount(condition) {
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('respositories').where(condition).count("resourceId as count").first()
//         },
//
//         /**
//          * 更新资源信息
//          * @param model
//          * @param condition
//          * @returns {Promise.<*>}
//          */
//         updateResourceInfo(model, condition) {
//
//             if (!type.object(model)) {
//                 return Promise.reject(new Error("model must be object"))
//             }
//
//             if (!type.object(condition)) {
//                 return Promise.reject(new Error("condition must be object"))
//             }
//
//             return knex.resource('resources').where(condition).update(model)
//         }
//     }
// }