module.exports = [{
  "Code": "S101",
  "Name": "License Agreement",
  "RuleName": "signing_event",
  "Description": "acknowledge a resource",
  "Params": "license_resource_id",
  "singleton": "TRUE"
}, {
  "Code": "A101",
  "Name": "Cycle End",
  "RuleName": "cycle_end_event",
  "Description": "raise when n cycle ends",
  "Params": "TIMEUNIT",
  "singleton": "FALSE"
}, {
  "Code": "S201",
  "Name": "Transaction",
  "RuleName": "transaction_event",
  "Description": "one time transaction",
  "Params": "amount,account",
  "singleton": "TRUE"
}, {
  "Code": "S202",
  "Name": "Settlement",
  "RuleName": "settlement_event",
  "Description": "fired when settlement cleared",
  "Params": "account",
  "singleton": "TRUE"
}, {
  "Code": "A102",
  "Name": "Fixed time",
  "RuleName": "time_event",
  "Description": "fired on a pre-determined time",
  "Params": "datetime",
  "singleton": "FALSE"
}, {
  "Code": "A103",
  "Name": "Relative time",
  "RuleName": "relative_time_event",
  "Description": "fired when certain amount of time elapsed",
  "Params": "elapsed,TIMEUNIT",
  "singleton": "FALSE"
}, {
  "Code": "S301",
  "Name": "Number of consumption",
  "RuleName": "view_count_event",
  "Description": "reserve a target number of authorizations, fires when such number reached",
  "Params": "amount",
  "singleton": "TRUE"
}, {
  "Code": "S302",
  "Name": "Number of recontraction",
  "RuleName": "recontract_count_event",
  "Description": "",
  "Params": "amount",
  "singleton": "TRUE"
}, {
  "Code": "S303",
  "Name": "Number of presented",
  "RuleName": "present_count_event",
  "Description": "",
  "Params": "amount",
  "singleton": "TRUE"
}, {
  "Code": "S210",
  "Name": "Escrow requirement met",
  "RuleName": "escrow_exceed_amount",
  "Description": "",
  "Params": "contract_account_name,amount,currency_unit",
  "singleton": "TRUE"
}, {
  "Code": "S211",
  "Name": "Escrow has been confiscated",
  "RuleName": "escrow_confiscated",
  "Description": "",
  "Params": "contract_account_name",
  "singleton": "TRUE"
}, {
  "Code": "S212",
  "Name": "Escrow has been refunded",
  "RuleName": "escrow_refunded",
  "Description": "",
  "Params": "contract_account_name",
  "singleton": "TRUE"
}]