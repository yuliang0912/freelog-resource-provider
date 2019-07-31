/**
 * 资源服务相关的事件
 */

'use strict'

module.exports = {

    /**
     * 创建资源事件
     */
    createResourceEvent: Symbol('resource#createResourceEvent'),

    /**
     * 创建mock资源事件
     */
    createMockResourceEvent: Symbol('resource#createMockResourceEvent'),

    /**
     * mock转换成资源事件
     */
    mockConvertToResourceEvent: Symbol('resource#mockConvertToResourceEvent'),

    /**
     * 更新mock资源源文件事件
     */
    updateMockResourceFileEvent: Symbol('resource#updateMockResourceFileEvent'),

    /**
     * 删除mock资源事件
     */
    deleteMockResourceEvent: Symbol('resource#deleteMockResourceEvent'),

    /**
     * 创建发行方案事件
     */
    createReleaseSchemeEvent: Symbol('release#createReleaseSchemeEvent'),

    /**
     * 与发行签约事件
     */
    releaseSchemeBindContractEvent: Symbol('release#releaseSchemeBindContractEvent'),
}
