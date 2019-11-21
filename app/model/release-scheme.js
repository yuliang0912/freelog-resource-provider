'use strict'

const lodash = require('lodash')

/**
 * 发行体的具体授权方案,用于解决内部授权问题.
 * @param app
 */
module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            return lodash.omit(ret, ['_id', 'dependencies', 'upcastReleases'])
        }
    }

    //上抛的发行信息
    const UpcastReleaseSchema = new mongoose.Schema({
        releaseId: {type: String, required: true},
        releaseName: {type: String, required: true},
    }, {_id: false})

    const BaseContractInfo = new mongoose.Schema({
        policyId: {type: String, required: true},  //不确定是否需要在新建方案时就确定策略.因为此时不签约.担心后续签约时,策略不存在.然后需要重新新建方案.
        contractId: {type: String, default: '', required: false}, //方案解决所使用的合同ID
    }, {_id: false})

    //声明处理的依赖
    const ResolveReleaseSchema = new mongoose.Schema({
        releaseId: {type: String, required: true},
        releaseName: {type: String, required: true},
        contracts: [BaseContractInfo],
    }, {_id: false})

    //发行体的对内处理方案
    const ReleaseSchemeSchema = new mongoose.Schema({
        schemeId: {type: String, required: true},
        releaseId: {type: String, required: true},
        resourceId: {type: String, required: true},
        version: {type: String, required: true},
        upcastReleases: [UpcastReleaseSchema], //方案实际上抛的发行资源
        resolveReleases: [ResolveReleaseSchema], //声明解决的发行资源
        //upcastCoverageRate: {type: Number, default: 0, min: 0, max: 100}, //依赖上抛率
        //合同签约状态  -1:签约异常 0:未签约 1:空合约(没有需要处理的,单一资源或者全上抛) 2:已签约
        contractStatus: {type: Number, default: 0, required: false},
        status: {type: Number, default: 0, required: false}, // 0:下架 1:上架
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    //方案ID目前是使用mongoObjectId,用算法计算releaseId和resourceId可能更合理一些.暂未调整
    // ReleaseSchemeSchema.virtual('schemeId').get(function () {
    //     return this.id
    // })

    ReleaseSchemeSchema.index({schemeId: 1}, {unique: true})
    ReleaseSchemeSchema.index({releaseId: 1, version: 1}, {unique: true})
    ReleaseSchemeSchema.index({releaseId: 1, resourceId: 1}, {unique: true})

    return mongoose.model('release-schemes', ReleaseSchemeSchema)
}