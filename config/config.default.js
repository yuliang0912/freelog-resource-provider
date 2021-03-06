'use strict';

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
                isCryptographic: true,
                accessKeyId: "TFRBSTRGcGNBRWdCWm05UHlON3BhY0tU",
                accessKeySecret: "M2NBYmRwQ1VESnpCa2ZDcnVzN1d2SXc1alhmNDNF",
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

        clientCredentialInfo: {
            clientId: 1002,
            publicKey: 'ad472200bda12d65666df7b97282a7c6',
            privateKey: '9d3761da71ee041e648cafb2e322d968'
        },

        customFileLoader: ['app/event-handler/app-events-listener.js'],

        rabbitMq: {
            connOptions: {
                host: '192.168.164.165',
                port: 5672,
                login: 'guest',
                password: 'guest',
                authMechanism: 'AMQPLAIN',
                heartbeat: 120  //每2分钟保持一次连接
            },
            implOptions: {
                reconnect: true,
                reconnectBackoffTime: 20000  //10秒尝试连接一次
            },
            exchange: {
                name: 'freelog-resource-exchange',
            },
            queues: []
        }
    }
}
