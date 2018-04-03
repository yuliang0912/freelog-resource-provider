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

    //管理申明合约
    router.put('/v1/resources/authSchemes/manageDependStatementContracts/:authSchemeId', controller.authScheme.v1.manageDependStatementContracts)
    //获取资源依赖树
    router.get('/v1/resources/getResourceDependencyTree/:resourceId', controller.resource.v1.getResourceDependencyTree)


    /**
     * 资源授权方案(授权点)
     */
    router.resources('/v1/resources/authSchemes', '/v1/resources/authSchemes', controller.authScheme.v1)

    /**
     * 资源本身相关API
     */
    router.resources('/v1/resources', '/v1/resources', controller.resource.v1)
    router.resources('/v2/resources', '/v2/resources', controller.resource.v2)
}
