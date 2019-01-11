/**
 * 资源meta检查
 */
'use strict'

const Patrun = require('patrun')
const lodash = require('lodash')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const widgetNameVersionCheck = require('./widget-name-version-check')
const resourceDependencyCheck = require('./resource_dependencies_check')

class ResourceAttributeCheck {

    constructor() {
        this.handlerPatrun = this._registerCheckHandler()
    }

    /**
     * 资源meta信息检查
     * @param resourceInfo
     */
    main(resourceInfo, attachInfo) {

        const checkHandlerFn = this.handlerPatrun.find({resourceType: resourceInfo.resourceType})

        if (!checkHandlerFn) {
            return Promise.resolve({systemMeta: {}})
        }

        return checkHandlerFn(resourceInfo, attachInfo)
    }

    /**
     * 注册检查者
     * @returns {*}
     * @private
     */
    _registerCheckHandler() {

        const patrun = Patrun()

        const checkBuild = (checkTask, resourceInfo, attachInfo) => {

            const dependencyCheckTask = resourceDependencyCheck.check({
                dependencies: attachInfo.dependencies,
                resourceId: resourceInfo.resourceId
            })

            return Promise.all([dependencyCheckTask, checkTask]).then(([dependencyInfo, checkInfo]) => {
                return {systemMeta: Object.assign({dependencies: []}, dependencyInfo, checkInfo)}
            }).then(systemMeta => {
                resourceInfo.systemMeta = lodash.defaultsDeep(systemMeta.systemMeta, resourceInfo.systemMeta)
            })
        }


        /**
         * 默认检查依赖
         */
        patrun.add({}, (resourceInfo, attachInfo) => checkBuild(undefined, resourceInfo, attachInfo))


        /**
         * WIDGET检查依赖和widget名称和版本信息
         */
        patrun.add({resourceType: resourceType.WIDGET}, (resourceInfo, attachInfo) => {

            const widgetNameVersionCheckTask = widgetNameVersionCheck.check({
                widgetInfo: attachInfo.widgetInfo,
                userId: resourceInfo.userId
            })

            return checkBuild(widgetNameVersionCheckTask, resourceInfo, attachInfo)
        })

        return patrun
    }
}

module.exports = new ResourceAttributeCheck()