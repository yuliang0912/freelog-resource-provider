'use strict'

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
    async check({fileStream, resourceName, resourceType, meta, userId}) {
        throw new Error("This method must be overwritten!");
    }
}