import {clean} from 'semver';
import {scope, provide} from 'midway';
import {CryptoHelper} from 'egg-freelog-base';

@scope('Singleton')
@provide('resourcePropertyGenerator')
export class ResourcePropertyGenerator {

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
