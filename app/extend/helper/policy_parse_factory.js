/**
 * Created by yuliang on 2017/9/25.
 */

'use strict'

const crypto = require('crypto')
const freelogPolicyParse = require('./policy/freelog_policy_parse')

module.exports = {
    /**
     * 授权策略转换
     * @param policyText
     * @param policyType
     * @returns {Array}
     */
    parse(policyText, policyType){
        if (!['yaml', 'freelog_policy_lang'].some(item => item === policyType)) {
            throw new Error('policyType must be in [yaml,freelog_policy_lang]')
        }

        let policySegments = []

        switch (policyType) {
            case 'yaml':
                break
            case 'freelog_policy_lang':
                policySegments = freelogPolicyParse(policyText)
                break
        }

        return policySegments.map(policySegmentIdGenerate)
    }
}


const policySegmentIdGenerate = (policySegment) => {

    let signObject = {
        fsmDescription: policySegment.fsmDescription,
        activatedStates: policySegment.activatedStates,
        initialState: policySegment.initialState,
        teminateState: policySegment.teminateState
    }

    let targetSignText = JSON.stringify(signObject).replace(/\s/g, "").toLowerCase()

    policySegment.segmentId = crypto.createHash('md5').update(targetSignText).digest('hex')

    return policySegment
}