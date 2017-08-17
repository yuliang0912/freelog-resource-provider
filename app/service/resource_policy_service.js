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
        createOrUpdateResourcePolicy(userId, resourceId, policySegment, policyId) {

            let policySegmentJson = yaml.safeLoad(policySegment)

            return mongoModels.resourcePolicy.findOneAndUpdate({resourceId: resourceId}, {
                policyId,
                policySegment: policySegmentJson,
                policyDescription: policySegment,
                updateDate: Date.now(),
            }, {select: 'userId'}).then(isExists => {
                if (isExists) {
                    return Promise.resolve(true)
                }
                return mongoModels.resourcePolicy.create({
                    resourceId, policyId, userId,
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

            return mongoModels.resourcePolicy.deleteOne(condition).then()
        }
    }
}