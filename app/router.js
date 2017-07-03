'use strict';

module.exports = app => {

    let controller = app.controller.resources

    /**
     * 资源restful wiki: http://eggjs.org/zh-cn/basics/router.html
     */
    app.resources('/v1/resources', '/v1/resources', controller.v1)
}
