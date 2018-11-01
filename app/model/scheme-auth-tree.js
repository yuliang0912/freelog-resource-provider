/**
 * Created by yuliang on 2017/8/15.
 */

'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            return lodash.omit(ret, ['_id'])
        }
    }

    const AuthTreeSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        contractId: {type: String, required: true},
        authSchemeId: {type: String, required: true},
        deep: {type: Number, required: true},
        parentAuthSchemeId: {type: String, required: false},
    }, {_id: false})

    const SchemeAuthTreeSchema = new mongoose.Schema({
        authSchemeId: {type: String, required: true, unique: true},
        resourceId: {type: String, required: true},
        authTree: {type: [AuthTreeSchema], default: []},
        status: {type: Number, default: 0, required: true} //状态 0:初始态
    }, {
        versionKey: false,
        toJSON: toObjectOptions,
        toObject: toObjectOptions,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'}
    })

    return mongoose.model('scheme-auth-tree', SchemeAuthTreeSchema)
}