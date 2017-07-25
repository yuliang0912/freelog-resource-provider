/**
 * Created by yuliang on 2017/7/25.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceRelationSchema = new Schema({
    resourceId: {type: Schema.Types.ObjectId, required: true},
    children: {type: Array, default: []}, //子节点ID集合
    createDate: {type: Date, default: Date.now},
    updateDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('resource_relation', ResourceRelationSchema);