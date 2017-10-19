'use strict';

module.exports = app => {
    /**
     * restful wiki: http://eggjs.org/zh-cn/basics/router.html
     */

    /**
     * 资源本身相关API
     */
    app.resources('/v1/resources', '/v1/resources', app.controller.resource.v1)

    //资源仓库
    app.get('/v1/resources/warehouse', app.controller.resource.v1.warehouse)

    /**
     * 资源引用策略相关API
     */
    app.resources('/v1/policies', '/v1/policies', app.controller.policy.v1)

    /**
     * 组合资源的付费策略相关API
     */
    app.resources('/v1/auths', '/v1/auths', app.controller.auth.v1)

}
