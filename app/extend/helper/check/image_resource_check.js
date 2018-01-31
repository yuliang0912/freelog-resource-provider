/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const sizeOf = require('image-size')

/**
 * 图片资源检测
 * @type {{checkFile: ((resourceName, meta, chunks))}}
 */
module.exports = {

    /**
     * 检查文件
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async checkFile({fileBuffer, mimeType}) {

        if (!/^image\/(bmp|cur|ico|psd|tiff|webp|svg|dds|jpg|png|gif|jpeg)$/i.test(mimeType)) {
            return {
                errors: [new Error("当前资源不是系统所支持的图片格式")]
            }
        }

        try {
            let imageFile = sizeOf(fileBuffer)
            return {
                systemMeta: {
                    width: imageFile.width,
                    height: imageFile.height
                }
            }
        } catch (err) {
            err.message += 'Image check error:'
            return {
                errors: [err]
            }
        }
    }
}

