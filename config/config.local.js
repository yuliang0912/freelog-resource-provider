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
        "userId": 10026,
        "username": "yuliang"
    },

    // mongoose: {
    //     url: "mongodb://127.0.0.1:27017/resource"
    // }

    mongoose: {
        url: "mongodb://172.18.215.231:27018/resource"
    },

    // mongoose: {
    //     url: "mongodb://119.23.45.143:27018/resource"
    // },
}
