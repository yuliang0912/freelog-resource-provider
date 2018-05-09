'use strict'

const sizeOf = require('image-size')
const fileType = require('file-type')

module.exports = class ImageFileCheck {

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
            const fileType = this.getFileType(fileBuffer)
            this.checkMimeType(fileType.mime)
            const imageFile = sizeOf(fileBuffer)
            return {fileType, width: imageFile.width, height: imageFile.height}
        })
    }

    /**
     * 检查mimetype
     * @param mimeType
     * @returns {Error}
     */
    checkMimeType(mimeType) {
        if (!/^image\/(bmp|cur|ico|psd|tiff|webp|svg|dds|jpg|png|gif|jpeg)$/i.test(mimeType)) {
            throw new Error("当前资源不是系统所支持的图片格式")
        }
    }

    /**
     * 获取文件的mime和ext
     * @param fileBuffer
     */
    getFileType(fileBuffer) {
        return fileType(fileBuffer)
    }
}
