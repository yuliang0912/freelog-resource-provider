/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const semver = require('semver')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')
const globalInfo = require('egg-freelog-base/globalInfo')

module.exports = {

    /**
     * 检查文件
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async checkFile({resourceName, meta, userId}) {

        if (!Reflect.has(meta, 'widgetName')) {
            return {errors: [new Error("meta中必须包含widgetName属性")]}
        }
        if (!Reflect.has(meta, 'version')) {
            return {errors: [new Error("meta中必须包含version属性")]}
        }

        let {widgetName, version} = meta

        if (!commonRegex.widgetName.test(widgetName)) {
            return {errors: [new Error("widgetName命名不符合规范")]}
        }
        if (!semver.valid(version)) {
            return {errors: [new Error("widget-version命名不符合 semantic versioning规范")]}
        }
        version = semver.clean(version)

        let lastWidget = await globalInfo.app.dataProvider.componentsProvider.findOne({widgetName})
        if (lastWidget && lastWidget.userId !== userId) {
            return {errors: [new Error("当前widgetName已经被使用")]}
        }
        if (lastWidget && !semver.gt(version, lastWidget.version)) {
            return {errors: [new Error(`version:${version}必须大于${lastWidget.version}`)]}
        }

        Reflect.deleteProperty(meta, 'version')
        Reflect.deleteProperty(meta, 'widgetName')

        return {
            systemMeta: {widgetName, version}
        }
    }
}