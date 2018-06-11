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
        return `${this.baseUrl}/api/v1/userinfos`
    }


    /**
     * 资源信息
     * @returns {string}
     */
    get resourceInfo() {
        return `${this.baseUrl}/api/v1/resources`
    }

    /**
     * 获取presentable信息
     */
    get presentableInfo() {
        return `${this.baseUrl}/api/v1/presentables`
    }

    /**
     * 获取节点信息
     * @returns {string}
     */
    get nodeInfo() {
        return `${this.baseUrl}/api/v1/nodes`
    }

    /**
     * 授权方案
     * @returns {string}
     */
    get authSchemeInfo() {
        return `${this.baseUrl}/api/v1/resources/authSchemes`
    }

    /**
     * 合同信息
     * @returns {string}
     */
    get contractInfo() {
        return `${this.baseUrl}/api/v1/contracts`
    }

    /**
     * 用户/节点分组
     * @returns {string}
     */
    get groupInfo() {
        return `${this.baseUrl}/api/v1/groups`
    }
}