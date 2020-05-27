// Generated from resourcePolicy.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by resourcePolicyParser.
function resourcePolicyListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

resourcePolicyListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
resourcePolicyListener.prototype.constructor = resourcePolicyListener;

// Enter a parse tree produced by resourcePolicyParser#policy.
resourcePolicyListener.prototype.enterPolicy = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#policy.
resourcePolicyListener.prototype.exitPolicy = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#segment.
resourcePolicyListener.prototype.enterSegment = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#segment.
resourcePolicyListener.prototype.exitSegment = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#declaration_section.
resourcePolicyListener.prototype.enterDeclaration_section = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#declaration_section.
resourcePolicyListener.prototype.exitDeclaration_section = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#declaration_statements.
resourcePolicyListener.prototype.enterDeclaration_statements = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#declaration_statements.
resourcePolicyListener.prototype.exitDeclaration_statements = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#custom_event_declaration.
resourcePolicyListener.prototype.enterCustom_event_declaration = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#custom_event_declaration.
resourcePolicyListener.prototype.exitCustom_event_declaration = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#one_or_more_event_decl.
resourcePolicyListener.prototype.enterOne_or_more_event_decl = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#one_or_more_event_decl.
resourcePolicyListener.prototype.exitOne_or_more_event_decl = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#single_custom_event_declaration.
resourcePolicyListener.prototype.enterSingle_custom_event_declaration = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#single_custom_event_declaration.
resourcePolicyListener.prototype.exitSingle_custom_event_declaration = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#custom_event_name.
resourcePolicyListener.prototype.enterCustom_event_name = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#custom_event_name.
resourcePolicyListener.prototype.exitCustom_event_name = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#custom_event_owner.
resourcePolicyListener.prototype.enterCustom_event_owner = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#custom_event_owner.
resourcePolicyListener.prototype.exitCustom_event_owner = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_declaration.
resourcePolicyListener.prototype.enterExpression_declaration = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_declaration.
resourcePolicyListener.prototype.exitExpression_declaration = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_handle.
resourcePolicyListener.prototype.enterExpression_handle = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_handle.
resourcePolicyListener.prototype.exitExpression_handle = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_definition.
resourcePolicyListener.prototype.enterExpression_definition = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_definition.
resourcePolicyListener.prototype.exitExpression_definition = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_call.
resourcePolicyListener.prototype.enterExpression_call = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_call.
resourcePolicyListener.prototype.exitExpression_call = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_call_argument.
resourcePolicyListener.prototype.enterExpression_call_argument = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_call_argument.
resourcePolicyListener.prototype.exitExpression_call_argument = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#environment_variable.
resourcePolicyListener.prototype.enterEnvironment_variable = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#environment_variable.
resourcePolicyListener.prototype.exitEnvironment_variable = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_declaration.
resourcePolicyListener.prototype.enterContract_account_declaration = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_declaration.
resourcePolicyListener.prototype.exitContract_account_declaration = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_types.
resourcePolicyListener.prototype.enterContract_account_types = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_types.
resourcePolicyListener.prototype.exitContract_account_types = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_name.
resourcePolicyListener.prototype.enterContract_account_name = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_name.
resourcePolicyListener.prototype.exitContract_account_name = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#audience_clause.
resourcePolicyListener.prototype.enterAudience_clause = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#audience_clause.
resourcePolicyListener.prototype.exitAudience_clause = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#state_definition_section.
resourcePolicyListener.prototype.enterState_definition_section = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#state_definition_section.
resourcePolicyListener.prototype.exitState_definition_section = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#state_definition.
resourcePolicyListener.prototype.enterState_definition = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#state_definition.
resourcePolicyListener.prototype.exitState_definition = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#state_description.
resourcePolicyListener.prototype.enterState_description = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#state_description.
resourcePolicyListener.prototype.exitState_description = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_description.
resourcePolicyListener.prototype.enterContract_account_description = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_description.
resourcePolicyListener.prototype.exitContract_account_description = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_state.
resourcePolicyListener.prototype.enterContract_account_state = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_state.
resourcePolicyListener.prototype.exitContract_account_state = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#state_transition.
resourcePolicyListener.prototype.enterState_transition = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#state_transition.
resourcePolicyListener.prototype.exitState_transition = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#account.
resourcePolicyListener.prototype.enterAccount = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#account.
resourcePolicyListener.prototype.exitAccount = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#state_id.
resourcePolicyListener.prototype.enterState_id = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#state_id.
resourcePolicyListener.prototype.exitState_id = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#proposer.
resourcePolicyListener.prototype.enterProposer = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#proposer.
resourcePolicyListener.prototype.exitProposer = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#acceptor.
resourcePolicyListener.prototype.enterAcceptor = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#acceptor.
resourcePolicyListener.prototype.exitAcceptor = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#currency_unit.
resourcePolicyListener.prototype.enterCurrency_unit = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#currency_unit.
resourcePolicyListener.prototype.exitCurrency_unit = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#license_resource_id.
resourcePolicyListener.prototype.enterLicense_resource_id = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#license_resource_id.
resourcePolicyListener.prototype.exitLicense_resource_id = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#users.
resourcePolicyListener.prototype.enterUsers = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#users.
resourcePolicyListener.prototype.exitUsers = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#datetime.
resourcePolicyListener.prototype.enterDatetime = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#datetime.
resourcePolicyListener.prototype.exitDatetime = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#resource_id.
resourcePolicyListener.prototype.enterResource_id = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#resource_id.
resourcePolicyListener.prototype.exitResource_id = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#event.
resourcePolicyListener.prototype.enterEvent = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#event.
resourcePolicyListener.prototype.exitEvent = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#natural_event.
resourcePolicyListener.prototype.enterNatural_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#natural_event.
resourcePolicyListener.prototype.exitNatural_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#reservation_event.
resourcePolicyListener.prototype.enterReservation_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#reservation_event.
resourcePolicyListener.prototype.exitReservation_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#custom_event.
resourcePolicyListener.prototype.enterCustom_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#custom_event.
resourcePolicyListener.prototype.exitCustom_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#contract_account_event.
resourcePolicyListener.prototype.enterContract_account_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#contract_account_event.
resourcePolicyListener.prototype.exitContract_account_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#escrow_exceed_amount.
resourcePolicyListener.prototype.enterEscrow_exceed_amount = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#escrow_exceed_amount.
resourcePolicyListener.prototype.exitEscrow_exceed_amount = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#escrow_confiscated.
resourcePolicyListener.prototype.enterEscrow_confiscated = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#escrow_confiscated.
resourcePolicyListener.prototype.exitEscrow_confiscated = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#escrow_refunded.
resourcePolicyListener.prototype.enterEscrow_refunded = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#escrow_refunded.
resourcePolicyListener.prototype.exitEscrow_refunded = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#event_placeholder.
resourcePolicyListener.prototype.enterEvent_placeholder = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#event_placeholder.
resourcePolicyListener.prototype.exitEvent_placeholder = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#and_event.
resourcePolicyListener.prototype.enterAnd_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#and_event.
resourcePolicyListener.prototype.exitAnd_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#cycle_end_event.
resourcePolicyListener.prototype.enterCycle_end_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#cycle_end_event.
resourcePolicyListener.prototype.exitCycle_end_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#time_event.
resourcePolicyListener.prototype.enterTime_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#time_event.
resourcePolicyListener.prototype.exitTime_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#relative_time_event.
resourcePolicyListener.prototype.enterRelative_time_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#relative_time_event.
resourcePolicyListener.prototype.exitRelative_time_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#elapsed.
resourcePolicyListener.prototype.enterElapsed = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#elapsed.
resourcePolicyListener.prototype.exitElapsed = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#transaction_event.
resourcePolicyListener.prototype.enterTransaction_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#transaction_event.
resourcePolicyListener.prototype.exitTransaction_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#signing_event.
resourcePolicyListener.prototype.enterSigning_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#signing_event.
resourcePolicyListener.prototype.exitSigning_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#access_count_event.
resourcePolicyListener.prototype.enterAccess_count_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#access_count_event.
resourcePolicyListener.prototype.exitAccess_count_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#settlement_event.
resourcePolicyListener.prototype.enterSettlement_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#settlement_event.
resourcePolicyListener.prototype.exitSettlement_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#recontract_count_event.
resourcePolicyListener.prototype.enterRecontract_count_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#recontract_count_event.
resourcePolicyListener.prototype.exitRecontract_count_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#present_count_event.
resourcePolicyListener.prototype.enterPresent_count_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#present_count_event.
resourcePolicyListener.prototype.exitPresent_count_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#view_count_event.
resourcePolicyListener.prototype.enterView_count_event = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#view_count_event.
resourcePolicyListener.prototype.exitView_count_event = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#amount.
resourcePolicyListener.prototype.enterAmount = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#amount.
resourcePolicyListener.prototype.exitAmount = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression_call_or_literal.
resourcePolicyListener.prototype.enterExpression_call_or_literal = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression_call_or_literal.
resourcePolicyListener.prototype.exitExpression_call_or_literal = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#expression.
resourcePolicyListener.prototype.enterExpression = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#expression.
resourcePolicyListener.prototype.exitExpression = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#multiplyingExpression.
resourcePolicyListener.prototype.enterMultiplyingExpression = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#multiplyingExpression.
resourcePolicyListener.prototype.exitMultiplyingExpression = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#powExpression.
resourcePolicyListener.prototype.enterPowExpression = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#powExpression.
resourcePolicyListener.prototype.exitPowExpression = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#signedAtom.
resourcePolicyListener.prototype.enterSignedAtom = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#signedAtom.
resourcePolicyListener.prototype.exitSignedAtom = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#built_in_function.
resourcePolicyListener.prototype.enterBuilt_in_function = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#built_in_function.
resourcePolicyListener.prototype.exitBuilt_in_function = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#funcname.
resourcePolicyListener.prototype.enterFuncname = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#funcname.
resourcePolicyListener.prototype.exitFuncname = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#atom.
resourcePolicyListener.prototype.enterAtom = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#atom.
resourcePolicyListener.prototype.exitAtom = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#scientific.
resourcePolicyListener.prototype.enterScientific = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#scientific.
resourcePolicyListener.prototype.exitScientific = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#constant.
resourcePolicyListener.prototype.enterConstant = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#constant.
resourcePolicyListener.prototype.exitConstant = function(ctx) {
};


// Enter a parse tree produced by resourcePolicyParser#variable.
resourcePolicyListener.prototype.enterVariable = function(ctx) {
};

// Exit a parse tree produced by resourcePolicyParser#variable.
resourcePolicyListener.prototype.exitVariable = function(ctx) {
};



exports.resourcePolicyListener = resourcePolicyListener;