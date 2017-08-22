/**
 * Created by yuliang on 2017/8/11.
 */


const yaml = require('js-yaml')
const mongoModels = require('../models/index')

module.exports = app => {
    return class ResourcePolicyService extends app.Service {

        /**
         * 创建资源授权引用策略
         */
        createOrUpdateResourcePolicy(userId, resourceId, policySegment) {

            let policySegmentJson = yaml.safeLoad(policySegment)

            return mongoModels.resourcePolicy.findOneAndUpdate({resourceId: resourceId}, {
                serialNumber: mongoModels.ObjectId,
                policySegment: policySegmentJson,
                policyDescription: policySegment,
            }, {select: '_id'}).then(policy => {
                if (policy) {
                    return Promise.resolve(policy)
                }
                return mongoModels.resourcePolicy.create({
                    resourceId, userId,
                    serialNumber: mongoModels.ObjectId,
                    policySegment: policySegmentJson,
                    policyDescription: policySegment
                })
            })
        }

        /**
         * 查询资源引用策略
         * @param resourceId
         * @returns return query,not executes
         */
        getResourcePolicy(condition) {

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.findOne(condition)
        }

        /**
         * 删除资源引用策略
         * @param condition
         * @returns {*}
         */
        deleteResourcePolicy(condition) {

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return this.updateResourcePolicy({status: 1}, condition).then()
        }

        /**
         * 更新消费策略
         * @param model
         * @param condition
         * @returns {*}
         */
        updateResourcePolicy(model, condition) {

            if (!this.app.type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.update(condition, model)
        }
    }
}