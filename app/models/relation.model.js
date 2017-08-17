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
    createDate: {type: Date, default: Date.now},
    updateDate: {type: Date, default: Date.now}
})

module.exports = mongoose.model('relation', ResourceRelationSchema)