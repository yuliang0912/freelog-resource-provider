'use strict'

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

        const {resourceId, version, createDate} = releaseSchemeInfo

        const latestVersion = {resourceId, version, createDate}
        return this.releaseProvider.findOneAndUpdate({_id: releaseInfo.id}, {
            $addToSet: {resourceVersions: latestVersion}, latestVersion
        })
    }
}
