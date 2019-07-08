'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            let result = Object.assign(lodash.pick(doc, ['mockResourceId', 'fullName']), lodash.omit(ret, ['_id', 'fileOss']))
            result.meta = result.meta || {}
            if (result.systemMeta && ret.fileOss) {
                result.systemMeta.filename = ret.fileOss.filename
            }
            return result
        }
    }

    const MockResourceSchema = new mongoose.Schema({
        sha1: {type: String, required: true},
        name: {type: String, required: true},
        bucketId: {type: String, required: true},
        bucketName: {type: String, required: true},
        resourceType: {type: String, required: true},
        fileOss: {
            serviceProvider: {type: String, required: false, default: 'aliyun'},
            filename: {type: String, required: true},
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
    MockResourceSchema.index({bucketName: 1, name: 1}, {unique: true})

    return mongoose.model('mock-resources', MockResourceSchema)
}