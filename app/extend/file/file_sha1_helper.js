/**
 * Created by yuliang on 2017/7/20.
 */

const crypto = require('crypto')
const imageMetaHelper = require('./lib/image_file_meta_helper')

module.exports = {
    /**
     * 根据文件流计算文件sha1值
     * @param fileStream
     */
    getFileMetaByStream(fileStream){
        return new Promise((resolve, reject) => {
            let sha1sum = crypto.createHash('sha1')
            let meta = {
                fileSize: 0,
                mimeType: fileStream.mimeType
            }
            let chunks = []
            fileStream.on('data', function (chunk) {
                sha1sum.update(chunk)
                meta.fileSize += chunk.length
                if (/^image\/(bmp|cur|ico|psd|tiff|webp|svg|dds|jpg|png|gif|jpeg)$/i.test(meta.mimeType)) {
                    chunks.push(chunk)
                }
            })
            fileStream.on('end', function () {
                meta.sha1 = sha1sum.digest('hex')
                if (chunks.length > 0) {
                    let imageMeta = imageMetaHelper(Buffer.concat(chunks))
                    meta = Object.assign(meta, imageMeta)
                }
                resolve(meta)
            })
            fileStream.on('error', function (err) {
                reject(err)
            })
        })
    }
}