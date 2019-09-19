'use strict';

/**
 * restful wiki: http://eggjs.org/zh-cn/basics/router.html
 */

module.exports = app => {

    const {router, controller} = app
    const {temporaryFile, resource, collection, release, mockResource, releaseScheme, mockResourceBucket} = controller

    //post-method-api
    router.post('upload-file', '/v1/resources/temporaryFiles/uploadResourceFile', temporaryFile.v1.uploadResourceFile)
    router.post('upload-preview-image', '/v1/resources/temporaryFiles/uploadPreviewImage', temporaryFile.v1.uploadPreviewImage)
    router.post('mock-convert-resource', '/v1/resources/mocks/:mockId/convert', mockResource.v1.convertToResource)

    //get-method-api
    router.get('resource-list', '/v1/resources/list', resource.v1.list)
    router.get('resource-releases', '/v1/resources/:resourceId/releases', resource.v1.releases)
    router.get('resource-joined-releases', '/v1/resources/releases', resource.v1.batchReleases)
    router.get('resource-sign-url', '/v1/resources/:resourceId/signedResourceInfo', resource.v1.signedResourceInfo)
    //router.get('resource-file-info', '/v1/resources/resourceFileInfo', resource.v1.resourceFileInfo)
    router.get('bucket-is-exist', '/v1/resources/mocks/buckets/isExist', mockResourceBucket.v1.isExistBucketName)
    router.get('mock-name-is-exist', '/v1/resources/mocks/isExistMockName', mockResource.v1.isExistMockName)
    router.get('release-list', '/v1/releases/list', release.v1.list)
    router.get('release-scheme-list', '/v1/releases/versions/list', releaseScheme.v1.list)
    router.get('release-detail-info', '/v1/releases/detail/:username/:releaseName', release.v1.detail)
    router.get('release-auth-tree', '/v1/releases/:releaseId/authTree', release.v1.releaseAuthTree)
    router.get('release-upcast-tree', '/v1/releases/:releaseId/upcastTree', release.v1.releaseUpcastTree)
    router.get('release-dependency-tree', '/v1/releases/:releaseId/dependencyTree', release.v1.dependencyTree)
    router.get('release-detail', '/v1/releases/detail', release.v1.detail)
    router.get('mock-resource-detail', '/v1/releases/mocks/detail', mockResource.v1.detail)
    router.get('release-max-satisfying-version', '/v1/releases/maxSatisfyingVersion', release.v1.maxSatisfyingVersion)

    router.get('resource-download', '/v1/resources/:resourceId/download', resource.v1.download)
    router.get('mock-resource-download', '/v1/resources/mocks/:mockResourceId/download', mockResource.v1.download)
    router.get('mock-resource-dependencyTree', '/v1/resources/mocks/:mockResourceId/dependencyTree', mockResource.v1.dependencyTree)
    router.get('release-is-collection', '/v1/collections/releases/isCollection', collection.v1.isCollection)
    router.get('bucket-count', '/v1/resources/mocks/buckets/count', mockResourceBucket.v1.count)
    router.get('release-version-resource-info', '/v1/releases/:releaseId/versions/:version/resource', releaseScheme.v1.resourceInfo)
    router.put('release-scheme-retry-sign-contract', '/v1/releases/:releaseId/versions/:version/retrySignContracts', releaseScheme.v1.retrySignContracts)

    //restful-api
    router.resources('release-info', '/v1/releases', release.v1)
    router.resources('release-scheme-info', '/v1/releases/:releaseId/versions', releaseScheme.v1)
    router.resources('mock-resource-bucket', '/v1/resources/mocks/buckets', mockResourceBucket.v1)
    router.resources('mock-resource', '/v1/resources/mocks', mockResource.v1)
    router.resources('collection-info', '/v1/collections/releases', collection.v1)
    router.resources('resource-info', '/v1/resources', resource.v1)
}
