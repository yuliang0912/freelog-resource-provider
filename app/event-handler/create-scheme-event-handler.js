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

        if (!releaseInfo.resolveReleases.length) { // 未解决其他发行,不牵扯到合约问题,则直接发送事件
            await this.sendSchemeCreatedEventToMessageQueue(releaseInfo, releaseSchemeInfo)
        }
    }

    /**
     * 发送方案创建事件
     * @param releaseInfo
     * @param releaseSchemeInfo
     * @returns {Promise<*>}
     */
    async sendSchemeCreatedEventToMessageQueue(releaseInfo, releaseSchemeInfo) {

        const ctx = this.app.createAnonymousContext()
        const {releaseId, schemeId, resourceId, version} = releaseSchemeInfo

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
                    contracts: item.contracts.map(x => x.contractId),
                    versionRanges: item.versionRanges
                }))
            }
        }

        return this.app.rabbitClient.publish(params)
    }
}
