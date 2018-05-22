'use strict'

const sizeOf = require('image-size')
const sendToWormhole = require('stream-wormhole')

module.exports = class ThumbnailImageCheck {

    /**
     * 图片文件检查
     * @param fileStream
     * @returns {Promise<any>}
     */
    check(fileStream) {

        const fileExt = fileStream.filename.substr(fileStream.filename.lastIndexOf('.') + 1).toLowerCase()
        if (!['tiff', 'webp', 'jpg', 'png', 'gif'].some(x => x === fileExt)) {
            return Promise.reject(new Error("当前资源不是系统所支持的图片格式(jpg|png|gif|tiff|webp)"))
        }

        return new Promise((resolve, reject) => {
            let chunks = [], fileSize = 0
            fileStream.on('data', chunk => {
                fileSize += chunk.length
                if (fileSize > 3145728) {
                    return reject(new Error('fileSize must be less then 3MB'))
                }
                chunks.push(chunk)
            }).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject)
        }).then(fileBuffer => {
            const imageFile = sizeOf(fileBuffer)
            if (imageFile.width > 4096 || imageFile.height > 4096) {
                throw new Error('图片宽高必须小于4096px')
            }
            return {fileBuffer, fileExt}
        })
    }
}