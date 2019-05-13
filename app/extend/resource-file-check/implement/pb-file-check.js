'use strict'

'use strict'

const lodash = require('lodash')
const chreeio = require('cheerio')
const fileCheckBase = require('../fileCheckBase')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class PageBuildFileCheck extends fileCheckBase {

    /**
     * PB文件检查
     * @returns {Promise<any>}
     */
    async check(ctx, {fileStream}) {

        const fileBuffer = await new Promise((resolve, reject) => {
            let chunks = []
            fileStream
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject)
        })

        return this._checkFileContentAndGetWidgets(ctx, fileBuffer)
    }

    /**
     * 检查文件内容,并且获取PB中的查件信息
     * @returns {Promise<*>}
     * @private
     */
    async _checkFileContentAndGetWidgets(ctx, fileBuffer) {

        const $ = chreeio.load(fileBuffer.toString())
        const widgets = $('[data-widget-src]').map((index, element) => $(element).attr('data-widget-src')).get()

        if (!widgets.length) {
            return {widgets: []}
        }

        const widgetReleases = await ctx.dal.releaseProvider.find({
            _id: {$in: widgets}, resourceType: resourceType.WIDGET
        })

        const diffResource = lodash.difference(widgets, widgetReleases.map(item => item.releaseId))
        if (diffResource.length) {
            throw new ApplicationError(`widgetIds:${diffResource.toString()} is not widget resource`)
        }

        return {widgets: widgetReleases.map(x => lodash.pick(x, ['releaseId', 'releaseName']))}
    }
}