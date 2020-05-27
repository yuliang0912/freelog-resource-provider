'use strict'

const {knexSymbol} = require('../constan')

module.exports = app => {
    const knex = require('knex')
    const config = app.config.knex

    let knexClients = {}
    Object.keys(config).forEach(name => {
        let selfConfig = config[name]

        selfConfig.pool = selfConfig.pool || {}
        selfConfig.pool.afterCreate = (conn, done) => {
            conn.on('error', err => {
                console.log(`mysql connection error : ${err.toString()}`)
                if (err.fatal) {
                    knexClients[name] = knex(selfConfig)
                }
            })
            done()
        }

        knexClients[name] = knex(selfConfig)
        knexClients[name].on('query-error', selfConfig.error || console.error)
    })

    app[knexSymbol] = knexClients
}