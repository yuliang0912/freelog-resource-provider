/**
 * Created by yuliang on 2017/7/25.
 */

const mongoose = require('mongoose')

/**
 * 此处重置Promise为bluebird.
 * mongoose内部使用的Promise/A+ 在处理reject时逻辑与bluebird不一致.导致框架异常
 */
mongoose.Promise = require('bluebird')

module.exports.connect = app => {
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

    return mongoose.connect(app.config.mongo.uri, {
        useMongoClient: true,
        poolSize: 5
    })
}


