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
    createReleaseCollection(model) {

        model.status = 0

        return super.findOneAndUpdate({
            releaseId: model.releaseId, userId: model.userId
        }, model, {new: true}).then(collectionInfo => {
            return collectionInfo || super.create(model)
        })
    }
}