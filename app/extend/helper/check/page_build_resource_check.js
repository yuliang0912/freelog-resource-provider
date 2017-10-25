/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const lodash = require('lodash')
const chreeio = require('cheerio')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const resourceProvider = require('../../../data-provider/resource-provider')

/**
 * pb资源检测
 * @type {{checkFile: ((resourceName, meta, chunks))}}
 */
module.exports = {

    /**
     * 检查文件
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async checkFile(resourceName, meta, fileBuffer, mimeType){

        let $ = chreeio.load(fileBuffer.toString())
        let widgets = $('[data-widget-src]').map((index, element) => {
            return $(element).attr('data-widget-src')
        }).get()

        if (!widgets.length) {
            return {errors: [new Error("PageBuild资源最少需要包含一个widget")]}
        }

        let widgetResources = await resourceProvider.getResourceByIds(widgets).where({
            status: 2,
            resourceType: resourceType.WIDGET
        }).map(item => {
            return {
                resourceId: item.resourceId,
                resourceName: item.resourceName,
                policyId: item.policyId
            }
        })

        let diffResource = lodash.difference(widgets, widgetResources.map(item => item.resourceId))

        return diffResource.length ? {
            errors: diffResource.map(item => {
                return new Error(`widgetId:${item} is not widget resource`)
            })
        } : {
            systemMeta: {widgets: widgetResources}
        }
    }
}