export declare class ResourcePropertyGenerator {
    /**
     * 获取资源具体版本的mimeType.目前通过文件的后缀名分析获得.
     * @param filename
     */
    getResourceMimeType(filename: string): string;
    /**
     * 生成资源版本ID
     * @param {string} resourceId
     * @param {string} version
     * @returns {string}
     */
    generateResourceVersionId(resourceId: string, version: string): string;
    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateResourceUniqueKey(resourceName: string): string;
}
