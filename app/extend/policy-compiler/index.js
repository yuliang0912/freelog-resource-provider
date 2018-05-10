'use strict'

const crypto = require('crypto')
const FreelogResourcePolicyCompiler = require('./freelog-resource-policy-compiler')

module.exports = class PolicyCompiler {

    /**
     * 编译策略语言
     * @param policyText
     * @param languageType
     * @param policyName
     */
    compiler({policyText, languageType, policyName}) {

    }


    _policySegmentIdGenerate(policySegment) {

        const signObject = {
            fsmDescription: policySegment.fsmDescription,
            activatedStates: policySegment.activatedStates,
            initialState: policySegment.initialState,
            teminateState: policySegment.teminateState
        }

        const targetSignText = JSON.stringify(signObject).replace(/\s/g, "").toLowerCase()

        policySegment.segmentId = crypto.createHash('md5').update(targetSignText).digest('hex')

        return policySegment
    }
}