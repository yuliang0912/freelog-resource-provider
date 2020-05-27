grammar eventDefinition;

event
  : natural_event
  | reservation_event
  | custom_event
  | event_placeholder
  ;

natural_event
  : cycle_end_event
  | signing_event
  | transaction_event
  | settlement_event
  ;

reservation_event
  : time_event
  | relative_time_event
  | access_count_event
  | contract_account_event
  ;

custom_event
  : custom_event_owner '.' custom_event_name
  ;

contract_account_event
  : escrow_exceed_amount
  | escrow_confiscated
  | escrow_refunded
  ;

escrow_exceed_amount
  : contract_account_name 'exceed' amount currency_unit
  ;

escrow_confiscated
  : contract_account_name '.' 'confiscated'
  ;

escrow_refunded
  : contract_account_name '.' 'refunded'
  ;

event_placeholder : EVENT ;


and_event
  : 'and' event
  ;

cycle_end_event
  : 'end' 'of' TIMEUNIT
  ;

time_event
  : 'at' datetime
  ;

relative_time_event
  : 'after' elapsed TIMEUNIT
  ;

elapsed: INT ;

transaction_event
  : 'receiving' amount 'to' account
  ;

signing_event
  : 'accepting' 'agreement' license_resource_id (',' license_resource_id)*
  ;

access_count_event
  : recontract_count_event
  | present_count_event
  | view_count_event
  ;

settlement_event
  : account 'settled'
  ;

recontract_count_event
  : amount 'of' 'recontractions' 'reached'
  ;

present_count_event
  : amount 'of' 'presentations' 'reached'
  ;

view_count_event
  : amount 'of' 'views' 'reached'
  ;

amount : expression_call_or_literal ;

expression_call_or_literal
  : expression_call
  | expression
  ;
