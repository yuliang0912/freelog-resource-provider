/**
 * Created by yuliang on 2017/7/25.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceRelationSchema = new Schema({
    resourceId: {type: String, required: true},
    children: {type: [String], default: []}, //子节点ID集合
    parentIds: {type: [String], default: []},  //父节点
    userId: {type: Number},
}, {versionKey: false, timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}})

ResourceRelationSchema.index({resourceId: 1});

module.exports = mongoose.model('relation', ResourceRelationSchema)