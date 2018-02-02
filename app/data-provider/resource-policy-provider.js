/**
 * Created by yuliang on 2017/11/6.
 */

'use strict'

const policyParse = require('../extend/helper/policy_parse_factory')
const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class ResourceTreeProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.ResourcePolicy)
        this.app = app
        this.resourcePolicy = app.model.ResourcePolicy
    }

    /**
     * 创建资源授权引用策略
     */
    createOrUpdateResourcePolicy({userId, resourceId, policyText, languageType, expireDate}) {

        let policySegment = policyParse.parse(policyText, languageType)

        return this.resourcePolicy.findOneAndUpdate({resourceId: resourceId}, {
            policyText, languageType, expireDate,
            serialNumber: this.app.mongoose.getNewObjectId(),
            policy: policySegment
        }).then(policy => {
            if (policy) {
                return super.findOne({resourceId: resourceId})
            }
            return super.create({
                resourceId, userId, policyText, languageType,
                serialNumber: this.app.mongoose.getNewObjectId(),
                policy: policySegment,
            })
        })
    }

    /**
     * 查询资源引用策略
     * @param resourceId
     * @returns return query,not executes
     */
    getResourcePolicy(condition) {
        return super.findOne(condition)
    }

    /**
     * 删除资源引用策略
     * @param condition
     * @returns {*}
     */
    deleteResourcePolicy(condition) {
        return super.update(condition, {status: 1})
    }

    /**
     * 更新消费策略
     * @param model
     * @param condition
     * @returns {*}
     */
    updateResourcePolicy(model, condition) {
        return super.update(condition, model)
    }

    /**
     * 根据policyId集合获取policy
     * @param policyIds
     */
    getPolicyList(condition) {

        let projection = 'serialNumber userId resourceId policy languageType policyText createDate updateDate status'

        return super.find(condition, projection)
    }
}