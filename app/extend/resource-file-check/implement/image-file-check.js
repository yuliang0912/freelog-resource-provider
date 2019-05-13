'use strict'

const sizeOf = require('image-size')
const mime = require('mime')
//const fileType = require('file-type')
const fileCheckBase = require('../fileCheckBase')
const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class ImageFileCheck extends fileCheckBase {

    /**
     * 图片文件检查
     */
    async check(ctx, {fileStream}) {

        const fileBuffer = await new Promise((resolve, reject) => {
            let chunks = []
            fileStream
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject)
        })

        this.checkMimeType(ctx, fileStream.filename)
        const {width, height} = sizeOf(fileBuffer)

        return {width, height}
    }

    /**
     * 检查mimetype
     * @returns {Error}
     */
    checkMimeType(ctx, fileName) {

        const fileExt = fileName.substr(fileName.lastIndexOf('.') + 1)
        const mimeType = mime.getType(fileExt)

        if (!/^image\/(jpg|png|gif|jpeg)$/i.test(mimeType)) {
            throw new ApplicationError(ctx.gettext('resource-image-extension-validate-failed', '(jpg|jpeg|png|gif)'))
        }
    }

    /**
     * 获取文件的mime和ext
     * 目前针对其他类型的文件检测的不准确,调整为根据后缀名来检测.不在读取文件信息中的mimetype
     * @param fileBuffer
     */
    // _getFileType(fileBuffer) {
    //     return fileType(fileBuffer)
    // }
}
