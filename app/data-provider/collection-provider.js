'use strict'

const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class CollectionProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.Collection)
    }

    /**
     * 收藏资源
     * @param model
     * @returns {PromiseLike<T> | Promise<T>}
     */
    createResourceCollection(model) {

        model.status = 0
        return super.findOneAndUpdate({
            resourceId: model.resourceId,
            userId: model.userId
        }, model).then(oldInfo => {
            return oldInfo ? super.findOne({resourceId: model.resourceId}) : super.create(model)
        })
    }
}