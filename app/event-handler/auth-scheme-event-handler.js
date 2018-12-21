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
            this.app.logger.error("authSchemeStateChangeHandler-error", error)
        })
    }

    /**
     * 发布授权点
     * @param authScheme
     */
    async releaseAuthSchemeEventHandler({authScheme}) {

        const {status, resourceId} = authScheme
        if (status !== 1) {
            return
        }

        const purpose = await this._getResourcePurpose(resourceId)

        return this.resourceProvider.updateResourceInfo({status: 2, purpose}, {resourceId}).catch(error => {
            console.error("authSchemeStateChangeHandler-error", error)
            this.app.logger.error("authSchemeStateChangeHandler-error", error)
        })
    }

    /**
     * 授权策略变更事件处理
     * @returns {Promise<void>}
     */
    async authPolicyModifyEventHandler({authScheme}) {

        const purpose = await this._getResourcePurpose(authScheme.resourceId)

        this.resourceProvider.updateResourceInfo({purpose}, {resourceId: authScheme.resourceId}).catch(error => {
            console.error("authSchemeStateChangeHandler-error", error)
            this.app.logger.error("authSchemeStateChangeHandler-error", error)
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
                if (policy.status != 1) {
                    return
                }
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
        this.app.on(authSchemeEvents.deleteAuthSchemeEvent, this.deleteAuthSchemeEventHandler.bind(this))
        this.app.on(authSchemeEvents.authPolicyModifyEvent, this.authPolicyModifyEventHandler.bind(this))
        this.app.on(authSchemeEvents.releaseAuthSchemeEvent, this.releaseAuthSchemeEventHandler.bind(this))
    }
}