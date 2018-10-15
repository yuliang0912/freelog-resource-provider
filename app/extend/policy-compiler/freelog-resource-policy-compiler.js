'use strict'

const freelogResourcePolicyLang = require('@freelog/resource-policy-lang')

module.exports = class FreelogResourcePolicyCompiler {

    /**
     * @param policyText
     * @param policyName
     */
    compiler({policyText, policyName}) {

        const {authorizedObjects, state_machine, errors, policy_text} = freelogResourcePolicyLang.compile(policyText)

        if (errors.length) {
            throw new Error("授权策略错误:" + errors.toString())
        }

        return {
            segmentId: '', policyName,
            status: 1, //默认可用
            authorizedObjects,
            policyText: policy_text,
            fsmDeclarations: state_machine.declarations,
            fsmStates: state_machine.states,
        }
    }
}
