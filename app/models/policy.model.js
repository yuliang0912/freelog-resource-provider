/**
 * Created by yuliang on 2017/8/11.
 */

'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceRelationSchema = new Schema({
    resourceId: {type: String, required: true},
    serialNumber: {type: String, required: true}, //序列号,用于校验前端与后端是否一致
    policySegment: {type: Array, default: []}, //引用策略段
    policyDescription: {type: String, default: ''}, //引用策略描述语言原文
    userId: {type: Number, required: true},
    status: {type: Number, default: 0, required: true},
}, {versionKey: false, timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}})

module.exports = mongoose.model('resourcePolicy', ResourceRelationSchema)