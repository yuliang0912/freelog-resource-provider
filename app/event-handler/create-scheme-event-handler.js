'use strict'

const lodash = require('lodash')
const {ReleaseSchemeCreatedEvent} = require('../enum/rabbit-mq-event')

module.exports = class CreateSchemeEventHandler {

    constructor(app) {
        this.app = app
        this.releaseProvider = app.dal.releaseProvider
    }

    /**
     * 事件处理
     * @param eventName
     * @returns {Promise<void>}
     */
    async handle(eventName, releaseInfo, releaseSchemeInfo) {

        const latestVersion = lodash.pick(releaseSchemeInfo, ['resourceId', 'version', 'createDate'])

        await this.releaseProvider.findOneAndUpdate({_id: releaseInfo.id}, {
            $addToSet: {resourceVersions: latestVersion}, latestVersion
        })
    }
}
