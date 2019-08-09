'use strict'

const {ReleaseSchemeBindContractEvent, ReleaseSchemeCreatedEvent} = require('../enum/rabbit-mq-event')

module.exports = class ReleaseSchemeBindContractEventHandler {

    constructor(app) {
        this.app = app
        this.releaseProvider = app.dal.releaseProvider
        this.releaseSchemeProvider = app.dal.releaseSchemeProvider
    }

    /**
     * 事件处理
     * @param eventName
     * @returns {Promise<void>}
     */
    async handle(eventName, schemeInfo, isUpdateBind = false) {

        if (isUpdateBind) {
            return this.sendSchemeBindContractEventToMessageQueue(schemeInfo).catch(error => {
                console.log('方案绑定合同MQ消息发送失败,schemeId:' + schemeInfo.schemeId)
            })
        }

        this.sendSchemeCreatedEventToMessageQueue(schemeInfo).catch(error => {
            console.log('方案创建消息发送失败,schemeId:' + schemeInfo.schemeId, error)
        })
    }

    /**
     * 发送方案创建事件
     * @param releaseInfo
     * @param releaseSchemeInfo
     * @returns {Promise<*>}
     */
    async sendSchemeCreatedEventToMessageQueue(releaseSchemeInfo) {

        const ctx = this.app.createAnonymousContext()
        const {releaseId, schemeId, resourceId, version} = releaseSchemeInfo
        const releaseInfo = await this.releaseProvider.findById(releaseId)

        if (!releaseInfo) {
            return
        }

        /**
         * releaseAuthTree中versionRanges若为空数组,则代表实际未使用,
         * 但是又作为依赖的发行的基础上抛(自己没上抛)必须解决.实际授权过程中针对此发行不做合约状态校验,但是需要把此情况反馈给授权系统.由授权系统做决策
         * @type {Array|void}
         */
        const releaseAuthTree = await ctx.service.releaseService.releaseAuthTree(releaseInfo, {resourceId, version})

        const params = {
            routingKey: ReleaseSchemeCreatedEvent.routingKey,
            eventName: ReleaseSchemeCreatedEvent.eventName,
            body: {
                releaseId, schemeId, resourceId, version,
                resolveReleases: releaseAuthTree.map(item => Object({
                    releaseId: item.releaseId,
                    contracts: item.contracts,
                    versionRanges: item.versionRanges
                }))
            }
        }

        return this.app.rabbitClient.publish(params)
    }


    /**
     * 发送报告
     * @returns {Promise<void>}
     */
    async sendSchemeBindContractEventToMessageQueue(releaseSchemeInfo) {

        const {releaseId, schemeId, resourceId, version, resolveReleases} = releaseSchemeInfo

        const params = {
            routingKey: ReleaseSchemeBindContractEvent.routingKey,
            eventName: ReleaseSchemeBindContractEvent.eventName,
            body: {releaseId, schemeId, resourceId, version, resolveReleases}
        }

        return this.app.rabbitClient.publish(params)
    }
}