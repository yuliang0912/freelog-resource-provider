'use strict'

const mime = require('mime')
const crypto = require('crypto')
const Patrun = require('patrun')
const pbFileCheck = new (require('./pb-file-check'))
const imageFileCheck = new (require('./image-file-check'))
const widgetFileCheck = new (require('./widget-file-check'))
const resourceTypes = require('egg-freelog-base/app/enum/resource_type')

module.exports = class FileGeneralCheck {

    constructor() {
        this.handlerPatrun = this._registerCheckHanlder()
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

        const checkHandlerFn = this.handlerPatrun.find({resourceType})

        if (!checkHandlerFn) {
            return Promise.resolve({systemMeta: {}})
        }

        return checkHandlerFn({fileStream, resourceName, resourceType, meta, userId})
    }

    /**
     * 注册检查者
     * @returns {*}
     * @private
     */
    _registerCheckHanlder() {

        const patrun = Patrun()

        const checkBuild = (checkHandler, ...args) => {
            const task1 = this._getFileBaseInfo(...args)
            const task2 = checkHandler ? checkHandler.check(...args) : undefined
            return Promise.all([task1, task2]).then(([fileBaseInfo, checkInfo]) => {
                return {systemMeta: Object.assign({dependencies: []}, fileBaseInfo, checkInfo)}
            })
        }

        /**
         * 默认计算文件大小和sha1值
         */
        patrun.add({}, (...args) => checkBuild(null, ...args))

        /**
         * IMAGE检查处理者
         */
        patrun.add({resourceType: resourceTypes.IMAGE}, (...args) => checkBuild(imageFileCheck, ...args))

        /**
         * PB文件检测
         */
        patrun.add({resourceType: resourceTypes.PAGE_BUILD}, (...args) => checkBuild(pbFileCheck, ...args))

        /**
         * WIDGET文件检测
         */
        patrun.add({resourceType: resourceTypes.WIDGET}, (...args) => checkBuild(widgetFileCheck, ...args))


        return patrun
    }

    /**
     * 获取文件的sha1值以及文件大小
     * @param fileStream
     * @returns {Promise<any>}
     */
    _getFileBaseInfo({fileStream}) {

        let fileSize = 0
        const sha1sum = crypto.createHash('sha1')
        const mimeType = mime.getType(fileStream.filename)

        return new Promise((resolve, reject) => {
            fileStream.on('data', chunk => {
                sha1sum.update(chunk)
                fileSize += chunk.length
            }).on('end', async function () {
                resolve({sha1: sha1sum.digest('hex'), fileSize, mimeType})
            }).on('error', reject)
        })
    }
}
