/**
 * Created by yuliang on 2017/10/25.
 */

'use strict'

module.exports = {

    middleware: ['errorHandler', 'localUserIdentity'],

    /**
     * 本地开发环境身份信息
     */
    localIdentity: {
        "userId": 50022,
        "username": "yuliang"
    },

    // mongoose: {
    //     url: "mongodb://127.0.0.1:27017/resource"
    // },

    mongoose: {
        url: "mongodb://39.108.77.211:30772/resource"
    },
}
