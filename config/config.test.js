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

    knex: {
        //资源相关DB配置
        resource: {
            connection: {
                host: '172.18.215.231',
                user: 'root',
                port: 3307,
                password: 'Ff@233109',
                database: 'fr_resource',
            },
            debug: false
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
    },

    gatewayUrl: "http://172.18.215.224:8895/test",
}