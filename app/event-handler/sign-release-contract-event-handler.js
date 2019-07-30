'use strict'

const lodash = require('lodash')
const {ReleaseSchemeBindContractEvent, ReleaseSchemeCreatedEvent} = require('../enum/rabbit-mq-event')

module.exports = class SignReleaseContractEventHandler {

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
    async handle(eventName, schemeId, contracts) {

        if (lodash.isEmpty(contracts)) {
            return
        }

        const contractMap = new Map(contracts.map(x => [`${x.partyOne}_${x.policyId}`, x]))
        const releaseSchemeInfo = await this.releaseSchemeProvider.findById(schemeId)

        const isInitializedScheme = releaseSchemeInfo.resolveReleases.some(x => x.contracts.some(m => m.contractId))

        for (let i = 0, j = releaseSchemeInfo.resolveReleases.length; i < j; i++) {
            const resolveRelease = releaseSchemeInfo.resolveReleases[i]
            for (let x = 0; x < resolveRelease.contracts.length; x++) {
                let contract = resolveRelease.contracts[x]
                let signedContractInfo = contractMap.get(`${resolveRelease.releaseId}_${contract.policyId}`)
                if (signedContractInfo) {
                    contract.contractId = signedContractInfo.contractId
                }
            }
        }

        await releaseSchemeInfo.updateOne({
            resolveReleases: releaseSchemeInfo.resolveReleases, contractStatus: 2
        }).catch(error => {
            console.log('合同ID赋值操作失败')
        })

        if (isInitializedScheme) {
            await this.sendSchemeBindContractEventToMessageQueue(releaseSchemeInfo).catch(error => {
                console.log('方案绑定合同MQ消息发送失败,schemeId:' + schemeId)
            })
        } else {
            await this.sendSchemeCreatedEventToMessageQueue(releaseSchemeInfo).catch(error => {
                console.log('方案创建消息发送失败,schemeId:' + schemeId)
            })
        }
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