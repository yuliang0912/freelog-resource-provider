import {provide, scope} from 'midway';
import * as probe from 'probe-image-size';
import {ApplicationError} from 'egg-freelog-base';

@scope('Singleton')
@provide('resourceFilePropertyGenerator')
export class ResourceFilePropertyGenerator {

    readonly imagePropertyMap = new Map([['width', '宽度'], ['height', '高度'], ['type', '类型'], ['mime', 'mime']]);

    /**
     * 获取资源文件属性
     * @param {{fileUrl: string; fileSize: number}} storageInfo
     * @param {string} resourceType
     * @returns {Promise<object[]>}
     */
    async getResourceFileProperty(storageInfo: { fileUrl: string, fileSize: number }, resourceType: string): Promise<object[]> {
        let systemProperties = [];
        if (resourceType.toLowerCase() === 'image') {
            systemProperties = await this.getImageProperty(storageInfo.fileUrl);
        }
        systemProperties.unshift({name: '文件大小', key: 'fileSize', value: storageInfo.fileSize});
        return systemProperties;
    }

    /**
     * 获取图片基础属性
     * @param fileUrl
     * @returns {Promise<object[]>}
     */
    async getImageProperty(fileUrl): Promise<object[]> {

        const systemProperties = [];
        const result = await probe(fileUrl).catch(error => {
            throw new ApplicationError('file is unrecognized image format');
        });

        for (const [key, value] of Object.entries(result)) {
            if (this.imagePropertyMap.has(key)) {
                const name = this.imagePropertyMap.get(key);
                systemProperties.push({name, key, value});
            }
        }

        return systemProperties;
    }
}
