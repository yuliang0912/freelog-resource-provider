/**
 * Created by yuliang on 2017/8/16.
 */


const mongoModels = require('../models/index')

module.exports = app => {
    return class ContractService extends app.Service {

        /**
         * 创建合约
         * @param model
         * @returns {Promise.<TResult>}
         */
        createContract(model) {

            if (!this.app.type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            return mongoModels.contract.create(model).then()
        }

        /**
         * 查询合约
         * @param condition
         * @returns {*}
         */
        getContract(condition) {

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.contract.findOne(condition)
        }
    }
}