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
        username: "root",
        password: "yuliang@@",
        database: "user_info",
        debug: true,
        config: {
            host: "127.0.0.1",
            port: 3306,
            dialect: "mysql2",
            timezone: "+08:00",
            pool: {
                maxConnections: 50,
                minConnections: 2,
                maxIdleTime: 10000
            }
        }
    },

    /**
     * 资源相关DB配置
     */
    resource: {
        username: "root",
        password: "yuliang@@",
        database: "fr_resource",
        debug: true,
        config: {
            host: "127.0.0.1",
            port: 3306,
            dialect: "mysql2",
            timezone: "+08:00",
            pool: {
                maxConnections: 50,
                minConnections: 2,
                maxIdleTime: 10000
            }
        }
    }
}