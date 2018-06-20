/**
 * 资源meta检查
 */
'use strict'

const Patrun = require('patrun')
const resourceType = require('egg-freelog-base/app/enum/resource_type')
const widgetNameVersionCheck = require('./widget-name-version-check')
const resourceDependencyCheck = require('./resource_dependencies_check')

class ResourceAttributeCheck {

    constructor() {
        this.handlerPatrun = this._registerCheckHanlder()
    }

    /**
     * 资源meta信息检查
     * @param resourceInfo
     */
    main(resourceInfo) {

        const checkHandlerFn = this.handlerPatrun.find({resourceType: resourceInfo.resourceType})

        if (!checkHandlerFn) {
            return Promise.resolve({systemMeta: {}})
        }

        return checkHandlerFn(resourceInfo)
    }

    /**
     * 注册检查者
     * @returns {*}
     * @private
     */
    _registerCheckHanlder() {

        const patrun = Patrun()

        const checkBuild = (checkTask, resourceInfo) => {

            const dependencyCheckTask = resourceDependencyCheck.check({
                dependencies: resourceInfo.meta.dependencies,
                resourceId: resourceInfo.resourceId
            })

            return Promise.all([dependencyCheckTask, checkTask]).then(([dependencyInfo, checkInfo]) => {
                return {systemMeta: Object.assign({dependencies: []}, dependencyInfo, checkInfo)}
            })
        }


        /**
         * 默认检查依赖
         */
        patrun.add({}, (resourceInfo) => checkBuild(undefined, resourceInfo))


        /**
         * WIDGET检查依赖和widget名称和版本信息
         */
        patrun.add({resourceType: resourceType.WIDGET}, (resourceInfo) => {

            const widgetNameVersionCheckTask = widgetNameVersionCheck.check({
                meta: resourceInfo.meta,
                userId: resourceInfo.userId
            })

            return checkBuild(widgetNameVersionCheckTask, resourceInfo)
        })

        return patrun
    }
}

module.exports = new ResourceAttributeCheck()