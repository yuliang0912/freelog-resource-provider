'use strict'

const lodash = require('lodash')

module.exports = class SignReleaseContractEventHandler {

    constructor(app) {
        this.app = app
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