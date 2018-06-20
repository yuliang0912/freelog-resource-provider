'use strict'

const lodash = require('lodash')
const globalInfo = require('egg-freelog-base/globalInfo')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

class ResourceDependenciceCheck {

    /**
     * 检查依赖
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async check({dependencies, resourceId}) {

        if (!Array.isArray(dependencies) || !dependencies.length) {
            return {dependencies: [], dependCount: 0}
        }

        dependencies = [...new Set(dependencies)] //去重
        if (dependencies.some(t => !commonRegex.resourceId.test(t))) {
            throw new Error('dependencies中必须是资源ID')
        }

        const resourceList = await globalInfo.app.dal.resourceProvider.getResourceByIdList(dependencies).map(item => {
            return {resourceId: item.resourceId, resourceName: item.resourceName}
        })
        if (resourceList.length !== dependencies.length) {
            throw new Error(`dependencies中存在无效的依赖资源.(${dependencies.toString()})`)
        }

        const allSubDependencies = dependencies.slice()
        const checkResult = await this._checkCircleDependency(resourceId, dependencies, allSubDependencies)

        if (checkResult) {
            throw new Error(`依赖中存在循环引用`)
        }

        return {dependencies: resourceList, dependCount: lodash.flattenDeep(allSubDependencies).length}
    }


    /**
     * 检查循环依赖,同时获取所有的叶级依赖
     * @param resourceId
     * @param dependencies
     * @returns {Promise<boolean>}
     */
    async _checkCircleDependency(resourceId, dependencies, allSubDependencies) {

        if (!dependencies.length) {
            return false
        }

        console.log(resourceId, dependencies)
        if (resourceId && dependencies.some(x => x === resourceId)) {
            return true
        }

        const subDependencies = await globalInfo.app.dal.resourceProvider.getResourceByIdList(dependencies).reduce((acc, item) => {
            if (!Array.isArray(item.systemMeta.dependencies) || !item.systemMeta.dependencies.length) {
                return acc
            }
            let subResourceIds = item.systemMeta.dependencies.map(x => x.resourceId)
            return [...acc, ...subResourceIds]
        }, [])

        allSubDependencies.push(subDependencies)

        const checkResult = await this._checkCircleDependency(resourceId, subDependencies, allSubDependencies)

        return subDependencies.length && checkResult
    }
}

module.exports = new ResourceDependenciceCheck()