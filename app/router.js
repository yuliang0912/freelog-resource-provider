'use strict';

module.exports = app => {
    /**
     * 资源restful wiki: http://eggjs.org/zh-cn/basics/router.html
     */
    app.resources('/v1/resources', '/v1/resources', app.controller.resources.v1)

    app.resources('/v1/policy', '/v1/policy', app.controller.policy.v1)
}
