'use strict'

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
                client: 'mysql2',
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
                    connectTimeout: 10000
                },
                pool: {
                    maxConnections: 50,
                    minConnections: 2,
                },
                acquireConnectionTimeout: 10000,
                debug: false
            }
        },

        /**
         * mongoDB配置
         */
        mongo: {
            uri: "mongodb://root:Ff233109@dds-wz9b5420c30a27941546-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9b5420c30a27942267-pub.mongodb.rds.aliyuncs.com:3717/resource?replicaSet=mgset-5016983"
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