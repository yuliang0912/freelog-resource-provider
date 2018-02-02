'use strict';

/**
 * restful wiki: http://eggjs.org/zh-cn/basics/router.html
 */

module.exports = app => {

    const {router, controller} = app;

    //资源仓库
    router.get('/v1/resources/warehouse', controller.resource.v1.warehouse)

    //资源列表
    router.get('/v1/resources/list', controller.resource.v1.list)

    router.post('/v1/resources/updateResourceContext/:resourceId', controller.resource.v1.updateResourceContext)

    router.get('/v1/resources/auth/getResource', controller.auth.v1.getResource)

    /**
     * 资源本身相关API
     */
    router.resources('/v1/resources', '/v1/resources', controller.resource.v1)

    /**
     * 资源引用策略相关API
     */
    router.resources('/v1/policies', '/v1/policies', controller.policy.v1)
}
