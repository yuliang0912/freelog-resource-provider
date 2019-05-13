'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            ret.meta = ret.meta || {}
            return lodash.omit(ret, ['_id', 'fileOss'])
        }
    }

    const ResourceInfoSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        aliasName: {type: String, required: true}, //对外展示名称,不同版本可以改动
        resourceType: {type: String, required: true},
        userId: {type: Number, required: true},
        intro: {type: String, required: false},
        description: {type: String, required: false},
        previewImages: {type: [String], required: false},
        customMimeType: {type: String, default: '', required: false},
        fileOss: {
            serviceProvider: {type: String, required: false, default: 'aliyun'},
            objectKey: {type: String, required: true},
            bucket: {type: String, required: true},
            region: {type: String, required: true},
            url: {type: String, required: true}
        },
        meta: {},
        systemMeta: {},
        status: {type: Number, default: 0, required: false}, // 0:临时文件状态  1:正式文件状态
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    ResourceInfoSchema.index({resourceId: 1}, {unique: true})

    return mongoose.model('resource-infos', ResourceInfoSchema)
}