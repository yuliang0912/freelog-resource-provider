'use strict'

const sizeOf = require('image-size')
const mime = require('mime')
//const fileType = require('file-type')
const fileCheckBase = require('../fileCheckBase')

module.exports = class ImageFileCheck extends fileCheckBase {

    /**
     * 图片文件检查
     * @param fileStream
     * @returns {Promise<any>}
     */
    check({fileStream}) {

        return new Promise((resolve, reject) => {
            let chunks = []
            fileStream.on('data', chunk => {
                chunks.push(chunk)
            }).on('end', () => {
                resolve(Buffer.concat(chunks))
            }).on('error', reject)
        }).then(fileBuffer => {
            this.checkMimeType(fileStream.filename)
            const imageFile = sizeOf(fileBuffer)
            return {width: imageFile.width, height: imageFile.height}
        })
    }

    /**
     * 检查mimetype
     * @param mimeType
     * @returns {Error}
     */
    checkMimeType(fileName) {

        const fileExt = fileName.substr(fileName.lastIndexOf('.') + 1)
        const mimeType = mime.getType(fileExt)

        if (!/^image\/(bmp|cur|ico|psd|tiff|webp|svg|dds|jpg|png|gif|jpeg)$/i.test(mimeType)) {
            throw new Error("当前资源不是系统所支持的图片格式")
        }
    }

    /**
     * 获取文件的mime和ext
     * 目前针对其他类型的文件检测的不准确,调整为根据后缀名来检测.不在读取文件信息中的mimetype
     * @param fileBuffer
     */
    getFileType(fileBuffer) {
        return fileType(fileBuffer)
    }
}
