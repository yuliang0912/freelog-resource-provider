'use strict';

const knexLib = require('./lib/database/knex')
const mongooseLib = require('./lib/database/mongoose')
const dataProviderLoader = require('./lib/loader/load-data-provider')

module.exports = app => {

    app.config.mongoose && mongooseLib(app)

    app.config.knex && knexLib(app)

    dataProviderLoader(app)
};