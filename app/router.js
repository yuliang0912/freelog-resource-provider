'use strict';

/**
 * restful wiki: http://eggjs.org/zh-cn/basics/router.html
 */

module.exports = app => {

    const {router, controller} = app
    const {resource, authScheme, collection, auth} = controller

    //资源仓库
    router.get('/v1/resources/warehouse', resource.v1.warehouse)

    //资源列表
    router.get('/v1/resources/list', resource.v1.list)

    //更新资源内容(开发版)
    router.post('/v1/resources/updateResourceContext/:resourceId', resource.v1.updateResourceContext)

    //获取资源授权的访问路径
    router.get('/v1/resources/auth/getResource', auth.v1.getResource)

    //批量签约(for授权点)
    router.put('/v1/resources/authSchemes/batchSignContracts/:authSchemeId', authScheme.v1.batchSignContracts)

    //获取资源依赖树
    router.get('/v1/resources/getResourceDependencyTree/:resourceId', resource.v1.getResourceDependencyTree)

    //上传资源预览图
    router.post('/v1/resources/upoladPreviewImage', '/v1/resources/upoladPreviewImage', resource.v1.upoladPreviewImage)

    /**
     * 资源授权方案(授权点)
     */
    router.resources('/v1/resources/authSchemes', '/v1/resources/authSchemes', authScheme.v1)

    /**
     * 资源收藏相关API
     */
    router.resources('/v1/resources/collections', '/v1/resources/collections', collection.v1)

    /**
     * 资源本身相关API
     */
    router.resources('/v1/resources', '/v1/resources', resource.v1)
}
