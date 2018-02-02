'use strict';

const fs = require('fs')

const globalInfo = require('egg-freelog-base/globalInfo')

module.exports = {

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

    mongoose: {
        url: "mongodb://192.168.0.99:27017/resource"
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
