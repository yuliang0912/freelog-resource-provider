'use strict'

'use strict'

const lodash = require('lodash')
const chreeio = require('cheerio')
const fileCheckBase = require('../fileCheckBase')
const globalInfo = require('egg-freelog-base/globalInfo')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class PageBuildFileCheck extends fileCheckBase {

    /**
     * PB文件检查
     * @param fileStream
     * @returns {Promise<any>}
     */
    async check({fileStream}) {

        const fileBuffer = await new Promise((resolve, reject) => {
            let chunks = []
            fileStream
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject)
        })

        return this._checkFileContentAndGetWidgets(fileBuffer)
    }

    /**
     * 检查文件内容,并且获取PB中的查件信息
     * @param fileBuffer
     * @returns {Promise<*>}
     * @private
     */
    async _checkFileContentAndGetWidgets(fileBuffer) {

        const $ = chreeio.load(fileBuffer.toString())
        const widgets = $('[data-widget-src]').map((index, element) => $(element).attr('data-widget-src')).get()

        if (!widgets.length) {
            return {widgets: []}
        }

        const widgetResources = await globalInfo.app.dataProvider.resourceProvider.getResourceByIdList(widgets).where({
            status: 2, resourceType: resourceType.WIDGET
        }).map(item => lodash.pick(item, ['resourceId', 'resourceName']))

        const diffResource = lodash.difference(widgets, widgetResources.map(item => item.resourceId))
        if (diffResource.length) {
            throw new ApplicationError(`widgetIds:${diffResource.toString()} is not widget resource`)
        }

        return {widgets: widgetResources}
    }
}