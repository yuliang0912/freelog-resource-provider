/**
 * Created by yuliang on 2017/6/30.
 */

const mongoDb = require('./app/models/db_start')

module.exports = async (app) => {

    global.eggApp = app
    global.Promise = require('bluebird')

    await mongoDb.connect(app)

}