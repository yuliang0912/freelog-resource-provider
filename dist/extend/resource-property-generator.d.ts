export declare class ResourcePropertyGenerator {
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
