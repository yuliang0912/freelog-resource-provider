/**
 * Created by yuliang on 2017/7/3.
 */

module.exports = app => {
    return class ResourceService extends app.Service {

        /**
         * 创建资源
         * @param resource 资源信息
         * @param sharePolicy 资源分享策略
         * @returns {Promise.<*>}
         */
        // async createResource(resource, sharePolicy) {
        //     let {type, knex} = this.app
        //
        //     if (!type.object(resource) || !type.object(sharePolicy)) {
        //         return Promise.reject(new Error("resource or sharePolicy is not object"))
        //     }
        //
        //     return knex.resource.transaction(trans => {
        //         let task1 = knex.resource('resources').transacting(trans).insert(resource)
        //         let task2 = knex.resource('resourceSharePolicy').transacting(trans).insert(sharePolicy)
        //
        //         return Promise.all([task1, task2]).then(trans.commit).catch(err => {
        //             trans.rollback()
        //             return err
        //         })
        //     })
        // }

        /**
         * 资源是否存在
         * @param condition
         * @returns {Promise.<void>}
         */
        async exists(condition) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("resource is not object"))
            }

            return knex.resource('resources').where(condition).select('resourceId').first()
        }


        /**
         * 创建资源信息
         * @param resource
         * @returns {Promise.<*>}
         */
        async createResource(resource) {
            let {type, knex} = this.app

            if (!type.object(resource)) {
                return Promise.reject(new Error("resource is not object"))
            }

            return knex.resource('resources').insert(resource)
        }


        /**
         * 获取单个资源信息
         * @param condition 查询条件
         * @returns {Promise.<*>}
         */
        async getResourceInfo(condition) {
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
        async getResourceList(condition, page, pageSize) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return knex.resource('resources').where(condition).limit(pageSize).offset((page - 1) * pageSize).select()
        }


        /**
         * 获取资源分享策略
         * @param condition
         * @returns {Promise.<*>}
         */
        async getResourceSharePolicy(condition) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return knex.resource('resources').where(condition).first()
        }

        /**
         * 编辑资源
         * @param model
         * @param condition
         * @returns {Promise.<*>}
         */
        async updateResource(model, condition) {
            let {type, knex} = this.app

            if (!type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            return knex.resource('resources').update(model).where(condition)
        }

        /**
         * 编辑资源分享策略
         * @param model
         * @param condition
         * @returns {Promise.<*>}
         */
        async editSharePolicy(model, condition) {
            let {type, knex} = this.app

            if (!type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            return knex.resource('resourceSharePolicy').update(model).where(condition)
        }
    }
}