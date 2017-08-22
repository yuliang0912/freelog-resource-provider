/**
 * Created by yuliang on 2017/7/25.
 */

const relation = require('./relation.model')
const resourcePolicy = require('./policy.model')
const mongoose = require('mongoose')

module.exports = {

    /**
     * 资源版本关系库
     */
    relation,

    /**
     * 资源分销策略
     */
    resourcePolicy,

    /**
     * 自动获取mongoseID
     * @returns {*}
     * @constructor
     */
    get ObjectId() {
        return new mongoose.Types.ObjectId
    }
}