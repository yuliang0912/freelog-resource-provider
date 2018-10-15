'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            return Object.assign({authSchemeId: doc.id}, lodash.omit(ret, ['_id']))
        }
    }

    const statementAuthSchemeSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        resourceName: {type: String, required: true},
        authSchemeId: {type: String, required: true},
        policySegmentId: {type: String, required: true},
        contractId: {type: String, default: ''}
    }, {_id: false})

    const resourceInfoSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        resourceName: {type: String, required: true}
    }, {_id: false})

    const associatedContractSchema = new mongoose.Schema({
        authSchemeId: {type: String, required: true},
        contractId: {type: String, required: true}
    }, {_id: false})

    const AuthSchemeSchema = new mongoose.Schema({
        authSchemeName: {type: String, required: true},
        resourceId: {type: String, required: true},
        dependCount: {type: Number, required: true}, //资源引用总数量(包含所有叶集节点)
        dependResources: {type: [String], default: []}, //依赖的资源(第一层依赖)
        statementState: {type: Number, default: 1, required: true}, //授权点类型 1:全部上抛(默认)  2:全包含  3:部分上抛
        policy: {type: Array, default: []}, //引用策略段
        languageType: {type: String, default: 'freelog_policy', required: true},
        bubbleResources: [resourceInfoSchema], //授权点上抛的资源(冒泡给上层)
        dutyStatements: [statementAuthSchemeSchema], //声明解决的资源
        associatedContracts: [associatedContractSchema], //声明所关联的合同
        statementCoverageRate: {type: Number, default: 0, min: 0, max: 100}, //授权依赖声明覆盖率
        contractCoverageRate: {type: Number, default: 0, min: 0, max: 100}, //指定执行合约覆盖率
        userId: {type: Number, required: true},
        status: {type: Number, default: 0, required: true}, // 0:初始状态 1:已发布  4:废弃(以后不允许在变动)
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    AuthSchemeSchema.virtual('authSchemeId').get(function () {
        return this.id
    })

    AuthSchemeSchema.index({resourceId: 1, userId: 1, status: 1});

    return mongoose.model('auth-scheme', AuthSchemeSchema)
}