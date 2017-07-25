/**
 * Created by yuliang on 2017/7/24.
 */

module.exports = (app, resourceId) => {
    let resourceInfo = app.service.resourceService.getResourceInfo({resourceId})

    switch (resourceInfo.resourceType) {
        case app.resourceEnum.IMAGE:

            break;
        default:
            break
    }
}