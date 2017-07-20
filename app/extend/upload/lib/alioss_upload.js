/**
 * Created by yuliang on 2017/7/4.
 */

const aliOss = require('ali-oss').Wrapper

module.exports = class aliOssUpload {

    constructor(config) {
        this.client = new aliOss(config)
    }

    /**
     * 以buffer的形式上传文件到阿里云OSS
     * WIKI:https://help.aliyun.com/document_detail/32072.html?spm=5176.doc32070.6.754.A49ih2
     * @param filePath 文件上传路径
     * @param fileBuffer 文件buffer
     * @returns {Promise.<T>}
     */
    putBuffer(filePath, fileBuffer) {
        return this.client.put(filePath, fileBuffer).then(ossInfo => {
            return ossInfo.url
        }).catch(err => {
            throw err
        })
    }

    /**
     * 以stream的形式上传文件到阿里云OSS
     * WIKI:https://help.aliyun.com/document_detail/32072.html?spm=5176.doc32070.6.754.A49ih2
     * @param filePath 文件上传路径
     * @param fileStream 文件流
     * @param contentLength 文件大小
     * @returns {Promise.<T>}
     */
    putStream(filePath, fileStream) {
        return this.client.putStream(filePath, fileStream)
    }
}