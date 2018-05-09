'use strict'

const globalInfo = require('egg-freelog-base/globalInfo')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

module.exports = {

    /**
     * 检查依赖
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async check({meta, resourceId}) {

        if (!Array.isArray(meta.dependencies) || !meta.dependencies.length) {
            return Promise.resolve({dependencies: []})
        }

        meta.dependencies = [...new Set(meta.dependencies)] //去重
        if (meta.dependencies.some(t => !commonRegex.resourceId.test(t))) {
            return Promise.reject("meta.dependencies中必须是资源ID")
        }

        let resourceList = await globalInfo.app.dal.resourceProvider.getResourceByIdList(meta.dependencies).map(item => {
            return {resourceId: item.resourceId, resourceName: item.resourceName}
        })
        if (resourceList.length !== meta.dependencies.length) {
            return Promise.reject(`meta.dependencies中存在无效的依赖资源.(${meta.dependencies.toString()})`)
        }

        let allSubDependencies = [...meta.dependencies]
        let checkResult = await this.checkCircleDependency(resourceId, meta.dependencies, allSubDependencies)

        if (checkResult) {
            return Promise.resolve("依赖中存在循环引用")
        }

        return Promise.resolve({dependencies: resourceList, allSubDependencies})
    },


    /**
     * 检查循环依赖
     * @param resourceId
     * @param dependencies
     * @returns {Promise<boolean>}
     */
    async checkCircleDependency(resourceId, dependencies, allSubDependencies) {

        if (!resourceId || !dependencies.length) {
            return false
        }

        if (dependencies.some(x => x === resourceId)) {
            return true
        }

        const subDependencies = await globalInfo.app.dal.resourceProvider.getResourceByIdList(dependencies).reduce((acc, item) => {
            if (!Array.isArray(item.systemMeta.dependencies) || !item.systemMeta.dependencies.length) {
                return acc
            }
            let subResourceIds = item.systemMeta.dependencies.map(x => x.resourceId)
            return [...acc, ...subResourceIds]
        }, [])

        allSubDependencies = [...allSubDependencies, ...subDependencies]

        if (subDependencies.length && this.checkCircleDependency(resourceId, subDependencies, allSubDependencies)) {
            return true
        }

        return false
    }
}