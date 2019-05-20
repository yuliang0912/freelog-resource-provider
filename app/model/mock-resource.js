'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            ret.meta = ret.meta || {}
            return Object.assign(lodash.pick(doc, ['mockResourceId', 'fullName']), lodash.omit(ret, ['_id', 'fileOss']))
        }
    }

    const MockResourceSchema = new mongoose.Schema({
        sha1: {type: String, required: true},
        name: {type: String, required: true},
        bucketId: {type: String, required: true},
        bucketName: {type: String, required: true},
        resourceType: {type: String, required: true},
        fileOss: {
            objectKey: {type: String, required: true},
            bucket: {type: String, required: true},
            region: {type: String, required: true},
            url: {type: String, required: true}
        },
        description: {type: String, required: false},
        previewImages: {type: [String], required: false},
        userId: {type: Number, required: true},
        status: {type: Number, default: 0, required: true}, // 0:正常 1:删除
        meta: {type: mongoose.Schema.Types.Mixed, default: {}, required: true},
        systemMeta: {},  //dependencies,fileSize,width,height,mimeType,widgetName,version等信息
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions
    })

    MockResourceSchema.virtual('mockResourceId').get(function () {
        return this.id
    })

    MockResourceSchema.virtual('fullName').get(function () {
        if (this.bucketName === undefined || this.name === undefined) {
            return ''
        }
        return `${this.bucketName}/${this.name}`
    })

    MockResourceSchema.index({userId: 1, name: 1, resourceType: 1})
    MockResourceSchema.index({bucketId: 1, name: 1}, {unique: true})

    return mongoose.model('mock-resources', MockResourceSchema)
}