/**
 * Created by yuliang on 2017/11/8.
 */

'use strict'

module.exports = {

    cluster: {
        listen: {
            port: 5001
        }
    },

    /**
     * mongoDB配置
     */
    mongoose: {
        url: "mongodb://172.18.215.231:27018/resource"
    },

    /**
     * 上传文件相关配置
     */
    uploadConfig: {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    }
}