'use strict'

module.exports = {

    knex: {
        //资源相关DB配置
        resource: {
            connection: {
                host: '172.18.215.231',
                user: 'root',
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