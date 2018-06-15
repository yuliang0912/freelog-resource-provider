'use strict'

const semver = require('semver')
const globalInfo = require('egg-freelog-base/globalInfo')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

class WidgetNameAndVersionCheck {

    /**
     * 检查插件资源(命名全局唯一,版本检测)
     * @param meta
     * @param userId
     * @returns {Promise<void>}
     */
    async check({meta, userId}) {

        if (!Reflect.has(meta, 'widgetName')) {
            throw new Error("meta中必须包含widgetName属性")
        }

        if (!Reflect.has(meta, 'version')) {
            throw new Error("meta中必须包含version属性")
        }

        let {widgetName, version} = meta

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

        Reflect.deleteProperty(meta, 'version')
        Reflect.deleteProperty(meta, 'widgetName')

        return {widgetName, version}
    }
}

module.exports = new WidgetNameAndVersionCheck()