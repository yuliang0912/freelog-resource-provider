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
            enable: true,
            defaultLocale: 'zh-CN'
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
            enableTypes: ['json', 'form', 'text']
        },

        middleware: ['errorHandler', 'identityAuthentication'],

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

        RasSha256Key: {
            resourceAuth: {
                publicKey: fs.readFileSync('config/auth_key/resource_auth_public_key.pem').toString()
            }
        },

        clientCredentialInfo: {
            clientId: 1002,
            publicKey: 'ad472200bda12d65666df7b97282a7c6',
            privateKey: '9d3761da71ee041e648cafb2e322d968'
        },

        customFileLoader: ['app/event-handler/app-events-listener.js']
    }
}
