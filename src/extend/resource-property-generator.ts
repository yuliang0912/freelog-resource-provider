import {clean} from 'semver';
import {scope, provide} from 'midway';
import {md5} from 'egg-freelog-base/app/extend/helper/crypto_helper';

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
        return md5(`${resourceId}-${clean(version)}`);
    }

    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateResourceUniqueKey(resourceName: string): string {
        return md5(`${resourceName.toLowerCase()}}`);
    }
}