/**
 * Created by yuliang on 2017/6/30.
 */

const knex = require('knex')

module.exports = dbConfig => {

    const knexClients = {}

    dbConfig && Object.keys(dbConfig).forEach(name => {
        let selfConfig = dbConfig[name]
        knexClients[name] = knex(selfConfig)
    })

    return knexClients
}