'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose

    const toObjectOptions = {
        transform(doc, ret, options) {
            return Object.assign({
                releaseId: doc.id,
                fullReleaseName: doc.fullReleaseName
            }, lodash.omit(ret, ['_id', 'signAuth']))
        }
    }

    const ResourceVersionSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
        version: {type: String, required: true},
        createDate: {type: Date, required: true}
    }, {_id: false})

    const BaseUpcastReleaseSchema = new mongoose.Schema({
        releaseId: {type: String, required: true},
        releaseName: {type: String, required: true},
    }, {_id: false})

    //创建合同时,实时编译.
    const PolicySchema = new mongoose.Schema({
        policyId: {type: String, required: true},
        policyName: {type: String, required: true},
        policyText: {type: String, required: true},
        status: {type: Number, required: true}, // 0:不启用  1:启用
        //策略的签约授权 1:允许再创作(recontractable)  2:只允许直接消费(presentable)  3:均可(位运算获得)
        signAuth: {type: Number, default: 0, required: true},
        authorizedObjects: [] //授权对象
    }, {_id: false})

    const ReleaseInfoSchema = new mongoose.Schema({
        username: {type: String, required: true}, //用户名(数字字母-组合而成,首位不能是-)
        releaseName: {type: String, required: true}, //发行名,同一个用户名下唯一,参考github
        resourceType: {type: String, required: true},//资源类型更新版本不允许修改
        resourceVersions: {type: [ResourceVersionSchema], required: true}, //发行下的资源版本信息
        intro: {type: String, required: false, default: ''},
        previewImages: {type: [String], required: false},
        latestVersion: {type: ResourceVersionSchema, required: true},
        baseUpcastReleases: [BaseUpcastReleaseSchema], //基础上抛范围,由第一个方案的上抛决定,后续不允许修改,其他方案的上抛范围必须小于或者等于基础上抛范围
        policies: [PolicySchema], //发行体的对外授权策略
        userId: {type: Number, required: true},
        signAuth: {type: Number, default: 0, required: true}, //签约授权 由策略中的signAuth共同决定 通过|运算获得
        status: {type: Number, default: 0, required: true} // 0:下架 1:上架
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    ReleaseInfoSchema.virtual('releaseId').get(function () {
        return this.id
    })

    ReleaseInfoSchema.virtual('fullReleaseName').get(function () {
        if (this.username === undefined || this.releaseName === undefined) {
            return ''
        }
        return `${this.username}/${this.releaseName}`
    })

    ReleaseInfoSchema.index({username: 1})
    ReleaseInfoSchema.index({userId: 1, releaseName: 1}, {unique: true})

    return mongoose.model('release-info', ReleaseInfoSchema)
}