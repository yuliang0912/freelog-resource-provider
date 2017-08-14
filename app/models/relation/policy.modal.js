/**
 * Created by yuliang on 2017/8/11.
 */

'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceRelationSchema = new Schema({
    resourceId: {type: String, required: true},
    policySegment: {type: Array, default: []}, //引用策略段
    policyDescription: {type: String, default: ''}, //引用策略描述语言原文
    userId: {type: Number},
    createDate: {type: Date, default: Date.now},
    updateDate: {type: Date, default: Date.now}
})

module.exports = mongoose.model('resourcePolicy', ResourceRelationSchema)