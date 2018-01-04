/**
 * Created by yuliang on 2017/11/6.
 */


const mongoModels = require('../models/index')
const policyParse = require('../extend/helper/policy_parse_factory')

module.exports = app => {

    const type = app.type

    return {

        /**
         * 创建资源授权引用策略
         */
        createOrUpdateResourcePolicy({userId, resourceId, policyText, languageType, expireDate}) {

            let policySegment = policyParse.parse(policyText, languageType)

            return mongoModels.resourcePolicy.findOneAndUpdate({resourceId: resourceId}, {
                policyText, languageType, expireDate,
                serialNumber: mongoModels.ObjectId,
                policy: policySegment
            }).then(policy => {
                if (policy) {
                    return Promise.resolve(policy)
                }
                return mongoModels.resourcePolicy.create({
                    resourceId, userId, policyText, languageType,
                    serialNumber: mongoModels.ObjectId,
                    policy: policySegment,
                })
            })
        },

        /**
         * 查询资源引用策略
         * @param resourceId
         * @returns return query,not executes
         */
        getResourcePolicy(condition) {

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.findOne(condition).exec()
        },

        /**
         * 删除资源引用策略
         * @param condition
         * @returns {*}
         */
        deleteResourcePolicy(condition) {

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.update(condition, model).then()
        },

        /**
         * 更新消费策略
         * @param model
         * @param condition
         * @returns {*}
         */
        updateResourcePolicy(model, condition) {

            if (!type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.update(condition, model)
        },

        /**
         * 根据policyId集合获取policy
         * @param policyIds
         */
        getPolicyList(condition) {

            if (!type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            let projection = 'serialNumber userId resourceId policy languageType policyText createDate updateDate status'

            return mongoModels.resourcePolicy.find(condition, projection).exec()
        }
    }
}