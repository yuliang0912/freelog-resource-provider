'use strict';

const dbConfig = require('./db_config/dbconfig_local')

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

        // bodyParser: {
        //     enable: false,
        // },

        middleware: ['errorHandler', 'basiceAuth'],

        /**
         * DB-mysql相关配置
         */
        dbConfig: dbConfig,

        /**
         * mongoDB配置
         */
        mongo: {
            uri: "mongodb://localhost:27017/resource_relation"
        },

        /**
         * 上传文件相关配置
         */
        uploadConfig: {
            curr: "aliOss",
            aliOss: {
                accessKeyId: "LTAIy8TOsSnNFfPb",
                accessKeySecret: "Bt5yMbW89O7wMTVQsNUfvYfou5GPsL",
                bucket: "freelog-shenzhen",
                internal: false,
                region: "oss-cn-shenzhen",
                timeout: 180000
            }
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
        }
    }

    return config;
};
