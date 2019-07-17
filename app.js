'use strict'

module.exports = (app) => {

    app.beforeStart(async () => {
        await app.rabbitClient.connect()
    })
}