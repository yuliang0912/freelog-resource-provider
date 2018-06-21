'use strict'

const authSchemeEvents = require('../enum/auth-scheme-events')

module.exports = class ResourceEventHandler {

    constructor(app) {
        this.app = app
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
            await app.dal.resourceProvider.updateResourceInfo({status: 2}, {resourceId: authScheme.resourceId})
        }
        //废弃授权点
        if (authScheme.status === 4) {
            await app.dal.authSchemeProvider.count({resourceId: authScheme.resourceId, status: 1}).then(count => {
                return count < 1 ? app.dal.resourceProvider.updateResourceInfo({status: 1}, {resourceId: authScheme.resourceId}) : null
            })
        }
    }

    /**
     * 注册事件处理者
     * @private
     */
    __registerEventHandler__() {

        // arguments : {authScheme}
        this.app.on(authSchemeEvents.createAuthSchemeEvent, (...args) => this.authSchemeStateChangeHandler(...args))
        this.app.on(authSchemeEvents.releaseAuthSchemeEvent, (...args) => this.authSchemeStateChangeHandler(...args))
        this.app.on(authSchemeEvents.deleteAuthSchemeEvent, (...args) => this.authSchemeStateChangeHandler(...args))

    }
}