/**
 * Created by yuliang on 2017/9/25.
 */

'use strict'

const uuid = require('node-uuid')
const freelogPolicyCompiler = require('freelog_policy_compiler')

module.exports = (policyText) => {
    let policySegment = freelogPolicyCompiler.compile(policyText)

    if (policySegment.errorMsg) {
        throw new Error(policySegment.errorMsg)
    }

    return policySegment.policy_segments.map(item => {
        return {
            segmentId: '',
            users: item.users,
            fsmDescription: item.state_transition_table.map(state => {
                return {
                    currentState: state.currentState,
                    nextState: state.nextState,
                    event: {
                        eventId: uuid.v4().replace(/-/g, ''),
                        eventName: state.event.eventName,
                        params: state.event.params,
                        type: state.event.type
                    }
                }
            }),
            activatedStates: item.activatedStates,
            initialState: item.initialState,
            teminateState: item.teminateState
        }
    })
}