'use strict'

const crypto = require('crypto')
const Patrun = require('patrun')
const pbFileCheck = new (require('./pb-file-check'))
const imageFileCheck = new (require('./image-file-check'))
const widgetFileCheck = new (require('./widget-file-check'))
const resourceTypes = require('egg-freelog-base/app/enum/resource_type')

module.exports = class FileGeneralCheck {

    constructor() {
        this.patrun = this._registerCheckHanlder()
    }

    /**
     * 主入口
     * @param fileStream
     * @param resourceName
     * @param resourceType
     * @param meta
     * @param userId
     */
    main({fileStream, resourceName, resourceType, meta, userId}) {

        const asyncHandler = this.patrun({resourceType})

        if (!asyncHandler) {
            return
        }

        return asyncHandler({fileStream})
    }

    /**
     * 注册检查者
     * @returns {*}
     * @private
     */
    _registerCheckHanlder() {

        const patrun = Patrun()

        patrun.add({resourceType: resourceTypes.IMAGE}, async ({fileStream}) => {

            const task1 = this._getFileSha1AndFileSize({fileStream})
            const task2 = imageFileCheck.check({fileStream})

            return await Promise.all([task1, task2]).then(([result1, result2]) => {
                return {systemMeta: Object.assign(result1, result2)}
            })
        })

        return patrun
    }

    /**
     * 获取文件的sha1值以及文件大小
     * @param fileStream
     * @returns {Promise<any>}
     */
    _getFileSha1AndFileSize({fileStream}) {

        let fileSize = 0
        const sha1sum = crypto.createHash('sha1')

        return new Promise((resolve, reject) => {
            fileStream.on('data', chunk => {
                sha1sum.update(chunk)
                fileSize += chunk.length
            }).on('end', async function () {
                const sha1 = sha1sum.digest('hex')
                resolve({sha1, fileSize})
            }).on('error', reject)
        })
    }
}
