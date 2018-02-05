'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const ResourceRelationSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        children: {type: [String], default: []}, //子节点ID集合
        parentIds: {type: [String], default: []},  //父节点
        userId: {type: Number}
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
    })

    ResourceRelationSchema.index({resourceId: 1});

    return mongoose.model('relation', ResourceRelationSchema)
}