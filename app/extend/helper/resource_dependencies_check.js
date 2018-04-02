'use strict'

const globalInfo = require('egg-freelog-base/globalInfo')
const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')
const lodash = require('lodash')

module.exports = {

    /**
     * 检查文件
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async check({meta}) {

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

        return Promise.resolve({dependencies: resourceList})
    }
}