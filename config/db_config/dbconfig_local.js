/**
 * Created by yuliang on 2017-06-28.
 * 开发环境DB配置
 */
"use strict"

module.exports = {
    /**
     * 用户相关DB配置
     */
    user: {
        client: 'mysql2',
        connection: {
            host: '127.0.0.1',
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
            host: '127.0.0.1',
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
}