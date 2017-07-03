/**
 * Created by yuliang on 2017-06-28.
 * 生产环境DB配置
 */


module.exports = {
    /**
     * 用户相关DB配置
     */
    userInfo: {
        username: "root",
        password: "yuliang@@",
        database: "user_info",
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