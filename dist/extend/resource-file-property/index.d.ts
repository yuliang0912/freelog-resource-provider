export declare class ResourceFilePropertyGenerator {
    readonly imagePropertyMap: Map<string, string>;
    /**
     * 获取资源文件属性
     * @param {{fileUrl: string; fileSize: number}} storageInfo
     * @param {string} resourceType
     * @returns {Promise<object[]>}
     */
    getResourceFileProperty(storageInfo: {
        fileUrl: string;
        fileSize: number;
    }, resourceType: string): Promise<object[]>;
    /**
     * 获取图片基础属性
     * @param fileUrl
     * @returns {Promise<object[]>}
     */
    getImageProperty(fileUrl: any): Promise<object[]>;
}
