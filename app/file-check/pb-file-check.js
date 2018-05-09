'use strict'

'use strict'

const lodash = require('lodash')
const chreeio = require('cheerio')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const globalInfo = require('egg-freelog-base/globalInfo')

module.exports = class PageBuildFileCheck {

    /**
     * PB文件检查
     * @param fileStream
     * @returns {Promise<any>}
     */
    async check({fileStream}) {

        return new Promise((resolve, reject) => {
            let chunks = []
            fileStream.on('data', chunk => {
                chunks.push(chunk)
            }).on('end', () => {
                resolve(Buffer.concat(chunks))
            }).on('error', reject)
        }).then(fileBuffer => {
            return this._checkFileContentAndGetWidgets(fileBuffer)
        })

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
            throw new Error("PageBuild资源最少需要包含一个widget")
        }

        // let diffDependencies = lodash.difference(widgets, meta.dependencies || [])
        // if (diffDependencies.length) {
        //     return {
        //         errors: diffResource.map(item => new Error(`widgetId:${item}没有在声明列表中`))
        //     }
        // }

        const widgetResources = await globalInfo.app.dataProvider.resourceProvider.getResourceByIdList(widgets).where({
            status: 2,
            resourceType: resourceType.WIDGET
        }).map(item => new Object({
            resourceId: item.resourceId,
            resourceName: item.resourceName,
        }))

        let diffResource = lodash.difference(widgets, widgetResources.map(item => item.resourceId))
        if (diffResource.length) {
            throw new Error(`widgetIds:${diffResource.toString()} is not widget resource`)
        }

        return widgetResources
    }
}