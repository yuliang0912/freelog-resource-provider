'use strict'

const restfulApiLocal = require('./restful-apis-local')
const restfulApiProd = require('./restful-apis-prod')

module.exports = class RestFulWebApis {

    constructor(config) {
        this.givenProvider = config.env === 'local'
            ? new restfulApiLocal(config.gatewayUrl)
            : new restfulApiProd(config.gatewayUrl)
    }

    /**
     * 用户信息
     */
    get userInfo() {
        return this.givenProvider.userInfo
    }

    /**
     * 资源信息
     * @returns {string}
     */
    get resourceInfo() {
        return this.givenProvider.resourceInfo
    }

    /**
     * 获取presentable信息
     */
    get presentableInfo() {
        return this.givenProvider.presentableInfo
    }

    /**
     * 获取节点信息
     * @returns {string}
     */
    get nodeInfo() {
        return this.givenProvider.nodeInfo
    }

    /**
     * 授权方案
     * @returns {string}
     */
    get authSchemeInfo() {
        return this.givenProvider.authSchemeInfo
    }

    /**
     * 合同信息
     * @returns {string}
     */
    get contractInfo() {
        return this.givenProvider.contractInfo
    }

    /**
     * 用户/节点分组
     * @returns {string}
     */
    get groupInfo() {
        return this.givenProvider.groupInfo
    }
}