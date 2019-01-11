'use strict'

const semver = require('semver')
const lodash = require('lodash')
const globalInfo = require('egg-freelog-base/globalInfo')
const {ApplicationError} = require('egg-freelog-base/error')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

class WidgetNameAndVersionCheck {

    /**
     * 检查插件资源(命名全局唯一,版本检测)
     * @param meta
     * @param userId
     */
    async check({widgetInfo, userId}) {

        if (!widgetInfo || lodash.isEqual(widgetInfo, {})) {
            throw new ApplicationError('插件资源缺失widgetName和version属性')
        }
        if (!Reflect.has(widgetInfo, 'widgetName')) {
            throw new Error("插件资源缺失widgetName属性")
        }
        if (!Reflect.has(widgetInfo, 'version')) {
            throw new Error("插件资源缺失version属性")
        }

        let {widgetName, version} = widgetInfo

        if (!commonRegex.widgetName.test(widgetName)) {
            throw new Error("widgetName命名不符合规范")
        }

        if (!semver.valid(version)) {
            throw new Error("widget-version命名不符合 semantic versioning规范")
        }

        version = semver.clean(version)

        const lastWidget = await globalInfo.app.dataProvider.componentsProvider.findOne({widgetName})
        if (lastWidget && lastWidget.userId !== userId) {
            throw new Error("当前widgetName已经被使用")
        }
        if (lastWidget && !semver.gt(version, lastWidget.version)) {
            throw new Error(`version:${version}必须大于${lastWidget.version}`)
        }

        return {widgetName, version}
    }
}

module.exports = new WidgetNameAndVersionCheck()