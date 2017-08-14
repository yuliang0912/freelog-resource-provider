/**
 * Created by yuliang on 2017/7/3.
 */

const moment = require('moment')

module.exports = app => {
    return class ResourceService extends app.Service {
        /**
         * 资源是否存在
         * @param condition
         * @returns {Promise.<void>}
         */
        count(condition) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition is not object"))
            }

            return knex.resource('resources').where(condition).count('resourceId as count').first()
        }


        /**
         * 创建资源信息
         * @param resource
         * @returns {Promise.<*>}
         */
        createResource(resource, parentId) {
            let {type, knex} = this.app

            if (!type.object(resource)) {
                return Promise.reject(new Error("resource is not object"))
            }

            return knex.resource.transaction(trans => {
                let task1 = knex.resource('resources').transacting(trans).insert(resource)
                let task2 = knex.resource.raw(`INSERT INTO respositories(resourceId,resourceName,lastVersion,userId,status,createDate) 
                 VALUES (:resourceId,:resourceName,:lastVersion,:userId,:status,:createDate) ON DUPLICATE KEY UPDATE lastVersion = :lastVersion`,
                    {
                        resourceId: parentId ? parentId : resource.resourceId,
                        resourceName: resource.resourceName,
                        lastVersion: resource.resourceId,
                        userId: resource.userId,
                        createDate: moment().toDate(),
                        status: 1
                    }).transacting(trans)

                return Promise.all([task1, task2]).then(trans.commit).catch(err => {
                    trans.rollback()
                    return err
                })
            })
        }


        /**
         * 获取单个资源信息
         * @param condition 查询条件
         * @returns {Promise.<*>}
         */
        getResourceInfo(condition) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return knex.resource('resources').where(condition).first()
        }

        /**
         * 获取多个资源
         * @param condition 资源查找条件
         * @returns {Promise.<*>}
         */
        getResourceList(condition, page, pageSize) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return knex.resource('resources').where(condition)
                .limit(pageSize).offset((page - 1) * pageSize)
                .orderBy('createDate', 'desc')
                .select()
        }

        /**
         * 根据主键ID集合批量获取资源
         * @param resourceIdList
         */
        getResourceByIdList(resourceIdList) {

            if (!Array.isArray(resourceIdList) || resourceIdList.length < 1) {
                return Promise.resolve([])
            }

            return this.app.knex.resource('resources').where('resourceId', 'in', resourceIdList)
        }


        /**
         * 编辑资源
         * @param model
         * @param condition
         * @returns {Promise.<*>}
         */
        updateResource(model, condition) {
            let {type, knex} = this.app

            if (!type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            return knex.resource('resources').update(model).where(condition)
        }

        /**
         * 获取资源仓储记录
         * @param condition
         */
        getRespositories(condition, page, pageSize) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return knex.resource('respositories').where(condition)
                .limit(pageSize).offset((page - 1) * pageSize)
                .orderBy('createDate', 'desc')
                .select()
        }
    }
}