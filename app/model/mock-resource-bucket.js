'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const MockResourceBucketSchema = new mongoose.Schema({
        bucketName: {type: String, required: true},
        userId: {type: Number, required: true},
        resourceCount: {type: Number, default: 0, required: true}, //文件数量
        totalFileSize: {type: Number, default: 0, required: true}, //总的文件大小(byte)
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
    })

    MockResourceBucketSchema.index({userId: 1})
    MockResourceBucketSchema.index({bucketName: 1}, {unique: true})

    return mongoose.model('mock-resource-buckets', MockResourceBucketSchema)
}