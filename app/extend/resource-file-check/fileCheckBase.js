'use strict'

const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class FileCheckBase {

    /**
     * 文件检测
     * @param fileStream
     * @param resourceName
     * @param resourceType
     * @param meta
     * @param userId
     * @returns {Promise<void>}
     */
    async check(ctx, {fileStream, resourceName, resourceType, meta, userId}) {
        throw new ApplicationError("This method must be overwritten!");
    }
}