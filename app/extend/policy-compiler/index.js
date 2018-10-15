'use strict'

const lodash = require('lodash')
const crypto = require('crypto')
const Patrun = require('patrun')
const {validator} = require('egg-freelog-base/app/extend/application')
const FreelogResourcePolicyCompiler = require('./freelog-resource-policy-compiler')

class PolicyCompiler {

    constructor() {
        this.compilerPatrun = this._registerCompiler()
    }

    /**
     * 编译策略语言
     * @param policyText
     * @param languageType
     * @param policyName
     */
    compiler({policyText, languageType = 'freelog_policy_lang', policyName}) {

        const compilerFn = this.compilerPatrun.find({languageType})

        if (!compilerFn) {
            throw new Error(`不被支持的策略语言类型:${languageType}`)
        }

        if (validator.isBase64(policyText)) {
            policyText = new Buffer(policyText, 'base64').toString()
        }

        return compilerFn({policyText, languageType, policyName})
    }

    /**
     * 注册不同编译语言对应的编译函数
     * @returns {*}
     * @private
     */
    _registerCompiler() {

        const patrun = Patrun()
        const freelogResourcePolicyCompiler = new FreelogResourcePolicyCompiler()

        /**
         * 飞致网络默认策略编译器
         */
        patrun.add({languageType: 'freelog_policy_lang'}, (...args) => {
            const policySegment = freelogResourcePolicyCompiler.compiler(...args)
            return this._policySegmentIdGenerate(policySegment)
        })

        return patrun
    }

    /**
     * 生成策略段ID
     * @param policySegment
     * @returns {*}
     * @private
     */
    _policySegmentIdGenerate(policySegment) {

        const signObject = lodash.pick(policySegment, ['authorizedObjects', 'fsmStates', 'fsmDeclarations'])

        const targetSignText = JSON.stringify(signObject).replace(/\s/g, "").toLowerCase()

        policySegment.segmentId = crypto.createHash('md5').update(targetSignText).digest('hex')

        return policySegment
    }
}

module.exports = new PolicyCompiler()