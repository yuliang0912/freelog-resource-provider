'use strict';

const fs = require('fs')
const path = require('path')

module.exports = app => {
    return {
        cluster: {
            listen: {port: 7001}
        },

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
        knex: {
            /**
             * 资源相关DB配置
             */
            resource: {
                client: 'mysql',
                connection: {
                    host: '192.168.2.181',
                    password: 'yuliang@@',
                    database: 'fr_resource',
                    charset: 'utf8',
                    timezone: '+08:00',
                    bigNumberStrings: true,
                    supportBigNumbers: true,
                    connectTimeout: 1500,
                    typeCast: (field, next) => {
                        if (field.type === 'JSON') {
                            return JSON.parse(field.string())
                        }
                        return next()
                    },
                },
                pool: {
                    max: 10, min: 2
                },
                acquireConnectionTimeout: 500, //每次查询等待的超时时间(从连接池拿可用的connection的超时时间)
                //idleTimeoutMillis: 3000, //连接空闲移除连接池的时间
                debug: false
            }
        },

        mongoose: {
            url: "mongodb://127.0.0.1:27017/resource"
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
            autoFields: false,
            defaultCharset: 'utf8',
            fieldNameSize: 100,
            fieldSize: '100kb',
            fields: 20,
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
            consoleLevel: 'NONE',
            level: 'ERROR',
        },

        //错误日志500MB自动分割
        logrotator: {
            filesRotateBySize: [
                path.join(app.root, 'logs', app.name, 'common-error.log'),
            ],
            maxFileSize: 1024 * 1024 * 1024 * 0.5,
        },

        notfound: {
            pageUrl: '/public/404.html',
        },

        gatewayUrl: "http://api.freelog.com",

        RasSha256Key: {
            resourceAuth: {
                publicKey: fs.readFileSync('config/auth_key/resource_auth_public_key.pem').toString()
            }
        },

        customLoader: [{
            name: 'eventHandler', dir: 'app/event-handler'
        }, {
            name: 'router1', dir: 'app/routers'
        }]
    }
}
