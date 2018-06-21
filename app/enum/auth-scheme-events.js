/**
 * 授权点相关的事件
 */

'use strict'

module.exports = {

    /**
     * 创建授权点事件
     */
    createAuthSchemeEvent: Symbol('authScheme#createAuthSchemeEvent'),

    /**
     * 发布授权点事件
     */
    releaseAuthSchemeEvent: Symbol('authScheme#releaseAuthSchemeEvent'),
    
    /**
     * 删除授权点事件
     */
    deleteAuthSchemeEvent: Symbol('authScheme#deleteAuthSchemeEvent'),

}
