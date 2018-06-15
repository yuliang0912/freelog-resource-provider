'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const UploadFileInfoSchema = new mongoose.Schema({
        sha1: {type: String, required: true},
        userId: {type: Number, required: true},
        resourceType: {type: String, required: true},
        objectKey: {type: String, required: true},
        resourceFileUrl: {type: String, required: true},
        systemMeta: {},
        expireDate: {type: Date, required: true},
        status: {type: Number, default: 0, required: true}, // 0:初始状态 1:已使用
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
    })

    UploadFileInfoSchema.index({sha1: 1, userId: 1}, {unique: true});

    return mongoose.model('upload-file-info', UploadFileInfoSchema)
}