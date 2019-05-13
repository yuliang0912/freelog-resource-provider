'use strict'

const {createReleaseSchemeEvent, signReleaseContractEvent} = require('../enum/resource-events')

module.exports = class ReleaseSchemeEventHandler {

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
    async handle(eventName, ...args) {

        switch (eventName) {
            case signReleaseContractEvent:
                return this.signReleaseContractEvent(...args)
            case createReleaseSchemeEvent:
                return this.createReleaseSchemeEventHandle(...args)
            default:
                break
        }
    }

    /**
     * 创建发型方案事件处理函数
     * @param releaseInfo
     * @param releaseSchemeInfo
     * @returns {Promise<void>}
     */
    async createReleaseSchemeEventHandle({releaseInfo, releaseSchemeInfo, version}) {

        const {resourceId} = releaseSchemeInfo
        if (releaseInfo.resourceVersions.some(x => x.resourceId === resourceId || x.version === version)) {
            return
        }

        var latestVersion = {
            resourceId, version, createDate: releaseSchemeInfo.createDate
        }

        await this.releaseProvider.findOneAndUpdate({_id: releaseInfo.id}, {
            $addToSet: {resourceVersions: latestVersion}, latestVersion
        }, {new: true})
    }

    /**
     * 合同签约事件
     * @param releaseScheme
     * @param contracts
     * @returns {Promise<void>}
     */
    async signReleaseContractEvent({schemeId, contracts}) {

        if (!Array.isArray(contracts) || !contracts.length) {
            return
        }

        const contractMap = new Map(contracts.map(x => [`${x.partyOne}_${x.policyId}`, x]))
        const releaseSchemeInfo = await this.releaseSchemeProvider.findById(schemeId, 'resolveReleases')

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

        await releaseSchemeInfo.updateOne({resolveReleases: releaseSchemeInfo.resolveReleases}).catch(error => {
            console.log('合同ID赋值操作失败')
        })
    }
}
