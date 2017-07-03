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

        middleware: ['errorHandler'], //koaBodyparse

        errorHandler: {},
        dbConfig: dbConfig,

    }

    return config;
};
