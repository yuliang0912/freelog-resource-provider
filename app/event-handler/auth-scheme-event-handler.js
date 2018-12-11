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
     * 删除授权方案
     * @param authScheme
     * @returns {Promise<void>}
     */
    async deleteAuthSchemeEventHandler({authScheme}) {
        if (authScheme.status !== 4) {
            return
        }
        const count = await this.authSchemeProvider.count({resourceId: authScheme.resourceId, status: 1})
        const purpose = await this._getResourcePurpose(authScheme.resourceId)

        const model = {purpose}
        if (count < 1) {
            model.status = 1
        }

        await this.resourceProvider.updateResourceInfo(model, {resourceId: authScheme.resourceId}).catch(error => {
            console.error("authSchemeStateChangeHandler-error", error)
            app.logger.error("authSchemeStateChangeHandler-error", error)
        })
    }

    /**
     * 发布授权点
     * @param authScheme
     */
    async releaseAuthSchemeEventHandler({authScheme}) {
        if (authScheme.status !== 1) {
            return
        }
        const purpose = await this._getResourcePurpose(authScheme.resourceId)
        return this.resourceProvider.updateResourceInfo({
            status: 2, purpose
        }, {resourceId: authScheme.resourceId}).catch(error => {
            console.error("authSchemeStateChangeHandler-error", error)
            app.logger.error("authSchemeStateChangeHandler-error", error)
        })
    }

    /**
     * 获取资源的使用目的
     * @param resourceId
     */
    async _getResourcePurpose(resourceId) {
        var purpose = 0
        await this.authSchemeProvider.find({resourceId, status: 1}, 'policy').each(authScheme => {
            if (purpose === 3) {
                return
            }
            authScheme.policy.forEach(policy => {
                if (policy.policyText.toLowerCase().includes('presentable')) {
                    purpose = purpose | 2
                }
                if (policy.policyText.toLowerCase().includes('recontractable')) {
                    purpose = purpose | 1
                }
            })
        })
        return purpose
    }

    /**
     * 注册事件处理者
     * @private
     */
    __registerEventHandler__() {
        this.app.on(authSchemeEvents.createAuthSchemeEvent, function () {
        })
        this.app.on(authSchemeEvents.releaseAuthSchemeEvent, this.releaseAuthSchemeEventHandler.bind(this))
        this.app.on(authSchemeEvents.deleteAuthSchemeEvent, this.deleteAuthSchemeEventHandler.bind(this))
    }
}