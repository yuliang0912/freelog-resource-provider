'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform: function (doc, ret, options) {
            return {
                resourceId: ret.resourceId,
                serialNumber: ret.serialNumber,
                policy: ret.policy,
                policyText: ret.policyText,
                languageType: ret.languageType,
                userId: ret.userId,
                status: ret.status
            }
        }
    }

    const ResourcePolicySchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        serialNumber: {type: String, required: true}, //序列号,用于校验前端与后端是否一致
        policy: {type: Array, default: []}, //引用策略段
        policyText: {type: String, default: ''}, //引用策略描述语言原文
        languageType: {type: String, required: true},
        userId: {type: Number, required: true},
        status: {type: Number, default: 0, required: true},
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    ResourcePolicySchema.index({resourceId: 1, userId: 1});
    
    return mongoose.model('policy', ResourcePolicySchema)
}