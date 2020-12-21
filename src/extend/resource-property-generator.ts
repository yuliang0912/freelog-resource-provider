import {clean} from 'semver';
import {scope, provide} from 'midway';
import {CryptoHelper} from 'egg-freelog-base';
import {getType} from 'mime';

@scope('Singleton')
@provide('resourcePropertyGenerator')
export class ResourcePropertyGenerator {

    /**
     * 获取资源具体版本的mimeType.目前通过文件的后缀名分析获得.
     * @param filename
     */
    getResourceMimeType(filename: string): string {
        return getType(filename) ?? 'application/octet-stream';
    }

    /**
     * 生成资源版本ID
     * @param {string} resourceId
     * @param {string} version
     * @returns {string}
     */
    generateResourceVersionId(resourceId: string, version: string): string {
        return CryptoHelper.md5(`${resourceId}-${clean(version)}`);
    }

    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateResourceUniqueKey(resourceName: string): string {
        return CryptoHelper.md5(`${resourceName.toLowerCase()}}`);
    }
}
