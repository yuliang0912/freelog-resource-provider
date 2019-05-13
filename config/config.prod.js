'use strict'

module.exports = {

    /**
     * mongoDB配置
     */
    mongoose: {
        url: "mongodb://172.18.215.231:27017/resource"
    },

    /**
     * 上传文件相关配置
     */
    uploadConfig: {
        aliOss: {
            internal: true
        },
        amzS3: {}
    },
}