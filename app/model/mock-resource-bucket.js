'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            return Object.assign({bucketId: doc.id}, lodash.omit(ret, ['_id']))
        }
    }

    const MockResourceBucketSchema = new mongoose.Schema({
        bucketName: {type: String, required: true},
        userId: {type: Number, required: true},
        resourceCount: {type: Number, default: 0, required: true}, //资源文件数量
        totalFileSize: {type: Number, default: 0, required: true}, //总的文件大小(byte)
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    MockResourceBucketSchema.index({userId: 1})
    MockResourceBucketSchema.index({bucketName: 1}, {unique: true})

    MockResourceBucketSchema.virtual('bucketId').get(function () {
        return this.id
    })

    return mongoose.model('mock-resource-buckets', MockResourceBucketSchema)
}