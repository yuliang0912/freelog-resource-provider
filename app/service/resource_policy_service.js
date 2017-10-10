/**
 * Created by yuliang on 2017/8/11.
 */

const yaml = require('js-yaml')
const mongoModels = require('../models/index')
const freelogPolicyCompiler = require('freelog_policy_compiler')

module.exports = app => {
    return class ResourcePolicyService extends app.Service {

        /**
         * 创建资源授权引用策略
         */
        createOrUpdateResourcePolicy({userId, resourceId, policyText, languageType, expireDate}) {

            let policySegment = this.ctx.helper.policyParse(policyText, languageType)

            return mongoModels.resourcePolicy.findOneAndUpdate({resourceId: resourceId}, {
                policyText, languageType, expireDate,
                serialNumber: mongoModels.ObjectId,
                policy: policySegment
            }).then(policy => {
                if (policy) {
                    return Promise.resolve(policy)
                }
                return mongoModels.resourcePolicy.create({
                    resourceId, userId, policyText, languageType, expireDate,
                    serialNumber: mongoModels.ObjectId,
                    policy: policySegment,
                })
            })
        }

        /**
         * 查询资源引用策略
         * @param resourceId
         * @returns return query,not executes
         */
        getResourcePolicy(condition) {

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.findOne(condition).exec()
        }

        /**
         * 删除资源引用策略
         * @param condition
         * @returns {*}
         */
        deleteResourcePolicy(condition) {

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return this.updateResourcePolicy({status: 1}, condition).then()
        }

        /**
         * 更新消费策略
         * @param model
         * @param condition
         * @returns {*}
         */
        updateResourcePolicy(model, condition) {

            if (!this.app.type.object(model)) {
                return Promise.reject(new Error("model must be object"))
            }

            if (!this.app.type.object(condition)) {
                return Promise.reject(new Error("condition must be object"))
            }

            return mongoModels.resourcePolicy.update(condition, model)
        }
    }
}


var a = {
    "ret": 0,
    "errcode": 0,
    "msg": "success",
    "data": {
        "policyId": "59a6768a7c73ab58cce07fb8",
        "resourceId": "0079935dbb4ee9c0553da4891f339e2240d98c4f",
        "serialNumber": "59c870fc1bc4491e908bca17",
        "policy": [
            {
                "contract_expire": {
                    "eventName": "contractExpire_12-12-201200:00",
                    "params": [
                        "12-12-201200:00"
                    ],
                    "type": "contractExpire"
                },
                "duration": {
                    "end_hour": null,
                    "start_hour": "03:30",
                    "end_date": "12-12-2012",
                    "start_date": "12-12-2012"
                },
                "policy_segments": [
                    {
                        "state_transition_table": [
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing_dais",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_h36r",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_dais"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_h36r"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_guarantyEvent_hozk",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_71fi",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent_hozk"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_71fi"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing_2xoz",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing-signing_1v46",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_2xoz"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-signing_1v46"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing_d2i9",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing-signing_gokz",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_d2i9"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-signing_gokz"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_guarantyEvent_b758",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_7ct4",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent_b758"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_7ct4"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing_30fi",
                                "event": {
                                    "eventName": "signing_licenseA",
                                    "params": [
                                        "licenseA"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_hqm5",
                                "event": {
                                    "eventName": "tbd",
                                    "params": "tbd",
                                    "type": "guarantyEvent"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_30fi"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "signing_licenseBN",
                                    "params": [
                                        "licenseBN"
                                    ],
                                    "type": "signing"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_hqm5"
                            },
                            {
                                "nextState": "activate",
                                "event": {
                                    "eventName": "pricingAgreement",
                                    "params": "tbd",
                                    "type": "pricingAgreement"
                                },
                                "currentState": "activatetwo"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "begining"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_dais"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_h36r"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent_hozk"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_71fi"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_2xoz"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-signing_1v46"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_d2i9"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-signing_gokz"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent_b758"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_guarantyEvent-signing_7ct4"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing_30fi"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "autoGenratedState_begining_activatetwo_signing-guarantyEvent_hqm5"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "activatetwo"
                            },
                            {
                                "nextState": "contractExpireState",
                                "event": {
                                    "eventName": "contractExpire_12-12-201200:00",
                                    "params": [
                                        "12-12-201200:00"
                                    ],
                                    "type": "contractExpire"
                                },
                                "currentState": "activate"
                            },
                            {
                                "nextState": "settlement",
                                "event": {
                                    "eventName": "settlementForward_3_day",
                                    "params": [
                                        3,
                                        "day"
                                    ],
                                    "type": "settlementForward"
                                },
                                "currentState": "activate"
                            },
                            {
                                "nextState": "activate",
                                "event": {
                                    "eventName": "accountSettled",
                                    "params": [],
                                    "type": "accountSettled"
                                },
                                "currentState": "settlement"
                            },
                            {
                                "nextState": "settlement",
                                "event": {
                                    "eventName": "settlementForward_3_day",
                                    "params": [
                                        3,
                                        "day"
                                    ],
                                    "type": "settlementForward"
                                },
                                "currentState": "activatetwo"
                            },
                            {
                                "nextState": "activatetwo",
                                "event": {
                                    "eventName": "accountSettled",
                                    "params": [],
                                    "type": "accountSettled"
                                },
                                "currentState": "settlement"
                            }
                        ],
                        "all_occured_states": [
                            "begining",
                            "autoGenratedState_begining_activatetwo_signing_dais",
                            "autoGenratedState_begining_activatetwo_signing-guarantyEvent_h36r",
                            "autoGenratedState_begining_activatetwo_guarantyEvent_hozk",
                            "autoGenratedState_begining_activatetwo_guarantyEvent-signing_71fi",
                            "autoGenratedState_begining_activatetwo_signing_2xoz",
                            "autoGenratedState_begining_activatetwo_signing-signing_1v46",
                            "autoGenratedState_begining_activatetwo_signing_d2i9",
                            "autoGenratedState_begining_activatetwo_signing-signing_gokz",
                            "autoGenratedState_begining_activatetwo_guarantyEvent_b758",
                            "autoGenratedState_begining_activatetwo_guarantyEvent-signing_7ct4",
                            "autoGenratedState_begining_activatetwo_signing_30fi",
                            "autoGenratedState_begining_activatetwo_signing-guarantyEvent_hqm5",
                            "activatetwo",
                            "activate"
                        ],
                        "states": [
                            "begining",
                            "activatetwo"
                        ],
                        "users": [
                            {
                                "users": [
                                    "userA",
                                    "userB"
                                ],
                                "userType": "individuals"
                            }
                        ]
                    }
                ],
                "errorMsg": null
            }
        ],
        "policyText": "This contract shall commence with effect from 12-12-2012 03:30 and shall continue until 12-12-2012 unless terminated earlier in accordance with its terms and conditions\nFor userA, userB: in begining:proceed to activatetwo on accepting license licenseA licenseB and contract_guaranty of 5000 refund after 1 day and license licenseBN\nin activatetwo: proceed to activate on accepting price priceExpression\nThe account settlement shall be performed on every 2 day in token state activate activatetwo",
        "languageType": "freelog_policy_lang",
        "userId": 1,
        "createDate": "2017-08-30T08:25:46.507Z",
        "updateDate": "2017-09-25T02:59:08.788Z",
        "expireDate": "2018-12-31T16:00:00.000Z",
        "status": 0
    }
}