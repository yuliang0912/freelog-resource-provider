/**
 * Created by yuliang on 2017/7/24.
 */


module.exports = async (app, resourceId) => {
    let resourceInfo = app.service.resourceService.getResourceInfo({resourceId})

    switch (resourceInfo.resourceType) {
        case app.resourceEnum.IMAGE:
            await app.ctx.curl(resourceInfo.resourceUrl).then(data => {
                data.data
            })
            break;
        default:
            break
    }
}