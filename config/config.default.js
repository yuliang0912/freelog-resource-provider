'use strict';

const fs = require('fs')

module.exports = appInfo => {

    const config = {
        keys: '20ab72d9397ff78c5058a106c635f008',

        i18n: {
            enable: false
        },

        /**
         * 关闭安全防护
         */
        security: {
            xframe: {
                enable: false,
            },
            csrf: {
                enable: false,
            }
        },

        ua: {
            enable: true
        },

        bodyParser: {
            enable: true,
        },

        middleware: ['errorHandler', 'identiyAuthentication'], //

        /**
         * DB-mysql相关配置
         */
        dbConfig: {
            /**
             * 用户相关DB配置
             */
            user: {
                client: 'mysql2',
                connection: {
                    host: '192.168.0.99',
                    user: 'root',
                    password: 'yuliang@@',
                    database: 'user_info',
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
                debug: true
            },

            /**
             * 资源相关DB配置
             */
            resource: {
                client: 'mysql2',
                connection: {
                    host: '192.168.0.99',
                    user: 'root',
                    password: 'yuliang@@',
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
                debug: true
            }
        },

        /**
         * mongoDB配置
         */
        mongo: {
            uri: "mongodb://192.168.0.99:27017/resource"
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
                internal: false,
                region: "oss-cn-shenzhen",
                timeout: 180000
            },
            amzS3: {}
        },

        multipart: {
            autoFields: true,
            defaultCharset: 'utf8',
            fieldNameSize: 100,
            fieldSize: '100kb',
            fields: 10,
            fileSize: '100mb',
            files: 10,
            fileExtensions: [],
            whitelist: (fileName) => true,
        },

        freelogBase: {
            retCodeEnum: {},
            errCodeEnum: {}
        },

        logger: {
            consoleLevel: 'DEBUG',
        },

        notfound: {
            pageUrl: '/public/404.html',
        },

        RasSha256Key: {
            resourceAuth: {
                publicKey: fs.readFileSync('config/auth_key/resource_auth_public_key.pem').toString()
            }
        }
    }

    return config;
};
