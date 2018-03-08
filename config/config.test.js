/**
 * Created by yuliang on 2017/11/8.
 */

'use strict'

module.exports = {
    knex: {
        //资源相关DB配置
        resource: {
            connection: {
                host: 'rm-wz93t7g809kthrub7.mysql.rds.aliyuncs.com',
                user: 'freelog_test',
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
        url: "mongodb://172.18.215.229:27017/resource"
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
}