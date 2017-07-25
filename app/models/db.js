/**
 * Created by yuliang on 2017/7/25.
 */

const mongoose = require('mongoose')

module.exports.connect = app => {

    mongoose.connect(app.config.mongo.uri);

    // 连接成功
    mongoose.connection.on('connected', function () {
        console.log('Mongoose connection open to ' + app.config.mongo.uri);
    })

    // 连接失败
    mongoose.connection.on('error', function (err) {
        console.log('Mongoose connection error: ' + err);
    })

    // 断开连接
    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose connection disconnected');
    })
}


