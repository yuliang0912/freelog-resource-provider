'use strict'

module.exports = class WebApiLocal {

    constructor(baseUrl) {
        this.baseUrl = baseUrl
    }


    /**
     * 用户信息
     * @returns {string}
     */
    get userInfo() {
        return 'http://127.0.0.1:7011/v1/userinfos'
    }


    /**
     * 资源信息
     * @returns {string}
     */
    get resourceInfo() {
        return 'http://127.0.0.1:7001/v1/resources'
    }

    /**
     * 获取presentable信息
     */
    get presentableInfo() {
        return 'http://127.0.0.1:7005/v1/presentables'
    }

    /**
     * 获取节点信息
     * @returns {string}
     */
    get nodeInfo() {
        return 'http://127.0.0.1:7005/v1/nodes'
    }

    /**
     * 授权方案
     * @returns {string}
     */
    get authSchemeInfo() {
        return 'http://127.0.0.1:7001/v1/resources/authSchemes'
    }

    /**
     * 合同信息
     * @returns {string}
     */
    get contractInfo() {
        return 'http://127.0.0.1:7008/v1/contracts'
    }

    /**
     * 用户/节点分组
     * @returns {string}
     */
    get groupInfo() {
        return 'http://127.0.0.1:7011/v1/groups'
    }
}