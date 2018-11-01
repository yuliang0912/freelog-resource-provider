'use strict'

const authSchemeEvents = require('../enum/auth-scheme-events')

module.exports = class ResourceEventHandler {

    constructor(app) {
        this.app = app
        this.resourceProvider = app.dal.resourceProvider
        this.authSchemeProvider = app.dal.authSchemeProvider
        this.__registerEventHandler__()
    }

    /**
     * 授权点状态变更处理
     * @param authScheme
     * @returns {Promise<void>}
     */
    async authSchemeStateChangeHandler({authScheme}) {

        const {app} = this

        //发布授权点
        if (authScheme.status === 1) {
            await this.resourceProvider.updateResourceInfo({status: 2}, {resourceId: authScheme.resourceId}).catch(error => {
                console.error("authSchemeStateChangeHandler-error", error)
                app.logger.error("authSchemeStateChangeHandler-error", error)
            })
        }

        //废弃授权点
        if (authScheme.status === 4) {
            await this.authSchemeProvider.count({resourceId: authScheme.resourceId, status: 1}).then(count => {
                return count < 1 ? app.dal.resourceProvider.updateResourceInfo({status: 1}, {resourceId: authScheme.resourceId}) : null
            }).catch(error => {
                console.error("authSchemeStateChangeHandler-error", error)
                app.logger.error("authSchemeStateChangeHandler-error", error)
            })
        }
    }

    /**
     * 注册事件处理者
     * @private
     */
    __registerEventHandler__() {

        this.authSchemeStateChangeHandler = this.authSchemeStateChangeHandler.bind(this)
        this.app.on(authSchemeEvents.createAuthSchemeEvent, this.authSchemeStateChangeHandler)
        this.app.on(authSchemeEvents.releaseAuthSchemeEvent, this.authSchemeStateChangeHandler)
        this.app.on(authSchemeEvents.deleteAuthSchemeEvent, this.authSchemeStateChangeHandler)

    }
}