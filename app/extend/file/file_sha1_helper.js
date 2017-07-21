/**
 * Created by yuliang on 2017/7/20.
 */

const crypto = require('crypto')

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
                fileName: fileStream.filename,
                mimeType: fileStream.mimeType,
                ext: getFileExt(fileStream.filename)
            }
            fileStream.on('data', function (chunk) {
                sha1sum.update(chunk)
                meta.fileSize += chunk.length
            })
            fileStream.on('end', function () {
                meta.sha1 = sha1sum.digest('hex')
                resolve(meta)
            })
            fileStream.on('error', function (err) {
                reject(err)
            })
        })
    }
}

const getFileExt = (str) => {
    let reg = /\.[^\.]+$/.exec(str);
    return reg ? reg[0] : ''
}