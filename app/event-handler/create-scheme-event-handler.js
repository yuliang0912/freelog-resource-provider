'use strict'

const lodash = require('lodash')

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

        return this.releaseProvider.findOneAndUpdate({_id: releaseInfo.id}, {
            $addToSet: {resourceVersions: latestVersion}, latestVersion
        })
    }
}
