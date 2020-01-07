/**
 * Created by yuliang on 2017/11/8.
 */

'use strict'

module.exports = {

    cluster: {
        listen: {
            port: 5001
        }
    },

    /**
     * mongoDB配置
     */
    mongoose: {
        url: "mongodb://mongo-test.common:27017/resource"
    },


    rabbitMq: {
        connOptions: {
            host: 'rabbitmq-test.common',
            port: 5672,
            login: 'test_user_resource',
            password: 'rabbit@freelog',
            authMechanism: 'AMQPLAIN'
        },
    },

    /**
     * 上传文件相关配置
     */
    uploadConfig: {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    }
}