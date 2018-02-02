'use strict'

const globalInfo = require('egg-freelog-base/globalInfo')

module.exports = appInfo => {
    return {
        /**
         * DB-mysql相关配置
         */
        dbConfig: {
            /**
             * 资源相关DB配置
             */
            resource: {
                client: 'mysql',
                connection: {
                    host: 'rm-wz9wj9435a0428942.mysql.rds.aliyuncs.com',
                    user: 'freelog',
                    password: 'Ff@233109',
                    database: 'fr_resource',
                    charset: 'utf8',
                    timezone: '+08:00',
                    bigNumberStrings: true,
                    supportBigNumbers: true,
                    dateStrings: true,
                    connectTimeout: 1500
                },
                pool: {
                    max: 10, min: 2,
                    afterCreate: (conn, done) => {
                        conn.on('error', err => {
                            console.log(`mysql connection error : ${err.toString()}`)
                            err.fatal && globalInfo.app.knex.resource.client.pool.destroy(conn)
                        })
                        done()
                    }
                },
                acquireConnectionTimeout: 500, //每次查询等待的超时时间(从连接池拿可用的connection的超时时间)
                //idleTimeoutMillis: 3000, //连接空闲移除连接池的时间
                debug: false
            }
        },

        /**
         * mongoDB配置
         */
        mongoose: {
            url: "mongodb://root:Ff233109@dds-wz9b5420c30a27941546-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9b5420c30a27942267-pub.mongodb.rds.aliyuncs.com:3717/resource?replicaSet=mgset-5016983"
        },

        /**
         * 上传文件相关配置
         */
        uploadConfig: {
            aliOss: {
                enable: true,
                accessKeyId: "LTAIy8TOsSnNFfPb",
                accessKeySecret: "Bt5yMbW89O7wMTVQsNUfvYfou5GPsL",
                bucket: "freelog-shenzhen",
                internal: true,
                region: "oss-cn-shenzhen",
                timeout: 180000
            },
            amzS3: {}
        },
    }
}