'use strict'

const Patrun = require('patrun')
const thumbnailImageCheck = require('./thumbnail-image-check')

class SubsidiaryFileCheck {

    constructor() {
        this.handlerPatrun = this._registerCheckHanlder()
    }

    /**
     * 主入口
     * @param fileStream
     * @param checkType
     */
    main({fileStream, checkType = 'thumbnailImage'}) {

        const checkHandlerFn = this.handlerPatrun.find({checkType})

        if (!checkHandlerFn) {
            return Promise.reject(new Error('未找到对应的检查函数'))
        }

        return checkHandlerFn({fileStream, checkType})
    }

    /**
     * 注册检查者
     * @returns {*}
     * @private
     */
    _registerCheckHanlder() {

        const patrun = Patrun()

        /**
         * 检测缩略预览图
         */
        patrun.add({checkType: 'thumbnailImage'}, ({fileStream}) => thumbnailImageCheck.check(fileStream))

        return patrun
    }

}

module.exports = new SubsidiaryFileCheck()