'use strict'

const sizeOf = require('image-size')
const {ApplicationError} = require('egg-freelog-base/error')

class ThumbnailImageCheck {

    /**
     * 图片文件检查
     * @param fileStream
     */
    async check(fileStream) {

        const fileExt = fileStream.filename.substr(fileStream.filename.lastIndexOf('.') + 1).toLowerCase()
        if (!['tiff', 'webp', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            throw new ApplicationError("当前资源不是系统所支持的图片格式(jpg|jpeg|png|gif|tiff|webp)")
        }

        const fileBuffer = await new Promise((resolve, reject) => {
            let chunks = [], fileSize = 0
            fileStream.on('data', chunk => {
                fileSize += chunk.length
                if (fileSize > 31451728) {
                    return reject(new Error('fileSize must be less than 3MB'))
                }
                chunks.push(chunk)
            }).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject)
        })

        const {width, height} = sizeOf(fileBuffer)
        if (width > 4096 || height > 4096) {
            throw new ApplicationError('图片宽高必须小于4096px')
        }

        return {fileBuffer, fileExt}
    }
}

module.exports = new ThumbnailImageCheck()