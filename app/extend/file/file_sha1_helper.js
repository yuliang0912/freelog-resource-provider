/**
 * Created by yuliang on 2017/7/20.
 */

const crypto = require('crypto')

module.exports = {

    /**
     * 根据文件地址计算sha1值
     * @param filePath
     */
    getFileSha1ByFilePath (filePath){

    },

    /**
     * 根据文件流计算文件sha1值
     * @param fileStream
     */
    getFileSha1ByStream(fileStream){
        return new Promise((resolve, reject) => {
            let sha1sum = crypto.createHash('sha1')
            fileStream.on('data', function (chunk) {
                sha1sum.update(chunk)
            })
            fileStream.on('end', function () {
                resolve(sha1sum.digest('hex'))
            })
            fileStream.on('error', function (err) {
                reject(err)
            })
        })
    }
}
