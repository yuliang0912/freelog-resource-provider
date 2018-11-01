'use strict'

const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class SchemeAuthTreeProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.SchemeAuthTree)
    }

    /**
     * 创建或更新授权树
     * @param model
     * @returns {Promise}
     */
    createOrUpdateAuthTree(model) {
        return super.findOneAndUpdate({authSchemeId: model.authSchemeId}, model, {new: true}).then(authTree => {
            return authTree || super.create(model)
        })
    }
}