/**
 * Created by yuliang on 2017/6/30.
 */

const knex = require('knex')

module.exports = dbConfig => {

    const knexClients = {}

    dbConfig && Object.keys(dbConfig).forEach(name => {
        let self = dbConfig[name]
        knexClients[name] = knex({
            client: self.config.dialect,
            connection: {
                host: self.config.host,
                user: self.username,
                password: self.password,
                database: self.database,
                charset: 'utf8'
            },
            pool: {
                min: self.config.pool.minConnections,
                max: self.config.pool.maxConnections,
            },
            acquireConnectionTimeout: self.config.pool.maxIdleTime,
            debug: self.debug
        })
    })

    return knexClients
}