/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

module.exports = {

    /**
     *根据资源ID获取资源信息
     * @param resourceIds
     * @returns {*|void}
     */
    getResourceByIds(resourceIds){
        return eggApp.knex.resource('resources').whereIn('resourceId', resourceIds).select()
    }
}