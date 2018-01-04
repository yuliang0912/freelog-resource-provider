/**
 * Created by yuliang on 2017/9/25.
 */

'use strict'

const uuid = require('node-uuid')
const freelogPolicyCompiler = require('freelog_policy_compiler')

module.exports = (policyText) => {
    let policySegment = freelogPolicyCompiler.compile(policyText)

    if (policySegment.errorMsg) {

        eggApp.logger.error('freelog_policy_compiler error:' + policySegment.errorMsg)
        eggApp.logger.error('freelog_policy_compiler policyText:' + policyText)

        throw new Error(policySegment.errorMsg)
    }
    let policy = policySegment.policy_segments.map(item => {
        return {
            segmentId: '',
            segmentText: item.segmentText,
            users: item.users,
            fsmDescription: item.state_transition_table,
            activatedStates: item.activatedStates,
            initialState: item.initialState,
            terminateState: item.terminateState
        }
    })

    policy.forEach(subPolicy => {
        subPolicy.fsmDescription.forEach(item => {
            setEventId(item.event)
        })
    })

    return policy
}

function setEventId(event) {
    event.eventId = uuid.v4().replace(/-/g, '')
    if (event.type === 'compoundEvents') {
        event.params.forEach(setEventId)
    }
}