'use strict'

module.exports = {

    /**
     * 发行的方案绑定关联合同事件(方案中选择作为授权使用的合约)
     */
    ReleaseSchemeBindContractEvent: Object.freeze({
        routingKey: 'release.scheme.bindContract',
        eventName: 'releaseSchemeBindContractEvent'
    }),

    /**
     * 发行方案创建事件
     */
    ReleaseSchemeCreatedEvent: Object.freeze({
        routingKey: 'release.scheme.created',
        eventName: 'releaseSchemeCreatedEvent'
    }),
}