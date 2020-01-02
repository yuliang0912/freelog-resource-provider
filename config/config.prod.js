'use strict'

module.exports = {
    
    mongoose: {
        url: "mongodb://mongo-prod.common:27017/resource"
    },


    /**
     * 上传文件相关配置
     */
    uploadConfig: {
        aliOss: {
            internal: true
        },
        amzS3: {}
    },

    rabbitMq: {
        connOptions: {
            host: '172.18.215.231',
            port: 5672,
            login: 'prod_user_auth',
            password: 'rabbit@freelog',
            authMechanism: 'AMQPLAIN'
        },
    },
}