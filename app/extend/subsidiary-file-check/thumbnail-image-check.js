'use strict'

const sizeOf = require('image-size')
const {ApplicationError} = require('egg-freelog-base/error')

class ThumbnailImageCheck {

    /**
     * 图片文件检查
     * @param fileStream
     */
    async check(ctx, fileStream) {

        const fileExt = fileStream.filename.substr(fileStream.filename.lastIndexOf('.') + 1).toLowerCase()
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            throw new ApplicationError(ctx.gettext('resource-image-extension-validate-failed', '(jpg|jpeg|png|gif)'))
        }

        const fileBuffer = await new Promise((resolve, reject) => {
            let chunks = [], fileSize = 0
            fileStream.on('data', chunk => {
                fileSize += chunk.length
                if (fileSize > 31451728) {
                    return reject(new Error(ctx.gettext('resource-file-size-limit-validate-failed', '3MB')))
                }
                chunks.push(chunk)
            }).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject)
        })

        const {width, height} = sizeOf(fileBuffer)
        if (width > 4096 || height > 4096) {
            throw new ApplicationError(ctx.gettext('resource-image-width-height-limit-validate-failed', '4096px'), {
                width,
                height
            })
        }

        return {fileBuffer, fileExt}
    }
}

module.exports = new ThumbnailImageCheck()