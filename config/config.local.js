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
        "userName": "",
        "nickname": "philyoung",
        "email": "",
        "mobile": "13480125810",
        "tokenSn": "a3a1abbfd0a541e9853073e5ab0132ff",
        "userRole": 1,
        "status": 1,
        "createDate": "2017-10-25T12:27:32.000Z",
        "updateDate": "2017-11-01T16:24:20.000Z"
    },

    mongoose: {
        url: "mongodb://127.0.0.1:27017/resource"
    }
}