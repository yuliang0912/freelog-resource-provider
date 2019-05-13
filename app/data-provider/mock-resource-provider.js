'use strict'

const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class MockResourceProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.MockResource)
    }

}