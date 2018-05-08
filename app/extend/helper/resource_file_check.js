/**
 * Created by yuliang on 2017/10/23.
 */

'use strcit'

const lodash = require('lodash')
const crypto = require('crypto')
const fileType = require('file-type');
const resourceType = require('egg-freelog-base/app/enum/resource_type')

const resourceTypeCheckMap = {

    /**
     * 图片资源检测
     */
    [resourceType.IMAGE]: require('./check/image_resource_check'),

    /**
     * pb资源检测
     */
    [resourceType.PAGE_BUILD]: require('./check/page_build_resource_check'),

    /**
     * 插件资源检测
     */
    [resourceType.WIDGET]: require('./check/widget_resource_check')

}

module.exports = {

    /**
     * 资源文件检测
     * @param fileStream
     * @param resourceName
     * @param resourceType
     * @param meta
     */
    resourceFileCheck(fileStream, resourceName, resourceType, meta, userId) {

        let chunks = []
        let sha1sum = crypto.createHash('sha1')
        let metaInfo = {
            meta: meta,
            systemMeta: {
                fileSize: 0,
                mimeType: fileStream.mimeType
            },
            errors: []
        }

        return new Promise((resolve, reject) => {
            fileStream.once('data', chunk => {
                metaInfo.systemMeta = Object.assign(metaInfo.systemMeta, fileType(chunk))
            })
            fileStream.on('data', function (chunk) {
                sha1sum.update(chunk)
                metaInfo.systemMeta.fileSize += chunk.length
                if (Reflect.has(resourceTypeCheckMap, resourceType)) {
                    chunks.push(chunk)
                }
            })
            fileStream.on('end', async function () {
                metaInfo.systemMeta.sha1 = sha1sum.digest('hex')
                if (Reflect.has(resourceTypeCheckMap, resourceType)) {
                    let fileBuffer = Buffer.concat(chunks)
                    let checkMeta = await resourceTypeCheckMap[resourceType].checkFile(
                        {
                            userId, resourceName, meta, fileBuffer,
                            mimeType: metaInfo.systemMeta.mime,
                            ext: metaInfo.systemMeta.ext,
                        }).catch(reject)
                    lodash.defaultsDeep(metaInfo, checkMeta)
                }
                resolve(metaInfo)
            })
            fileStream.on('error', reject)
        })
    }
}



