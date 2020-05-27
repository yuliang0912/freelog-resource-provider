// Generated from resourcePolicy.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by resourcePolicyParser.

function resourcePolicyVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

resourcePolicyVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
resourcePolicyVisitor.prototype.constructor = resourcePolicyVisitor;

// Visit a parse tree produced by resourcePolicyParser#policy.
resourcePolicyVisitor.prototype.visitPolicy = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#segment.
resourcePolicyVisitor.prototype.visitSegment = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#declaration_section.
resourcePolicyVisitor.prototype.visitDeclaration_section = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#declaration_statements.
resourcePolicyVisitor.prototype.visitDeclaration_statements = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#custom_event_declaration.
resourcePolicyVisitor.prototype.visitCustom_event_declaration = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#one_or_more_event_decl.
resourcePolicyVisitor.prototype.visitOne_or_more_event_decl = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#single_custom_event_declaration.
resourcePolicyVisitor.prototype.visitSingle_custom_event_declaration = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#custom_event_name.
resourcePolicyVisitor.prototype.visitCustom_event_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#custom_event_owner.
resourcePolicyVisitor.prototype.visitCustom_event_owner = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_declaration.
resourcePolicyVisitor.prototype.visitExpression_declaration = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_handle.
resourcePolicyVisitor.prototype.visitExpression_handle = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_definition.
resourcePolicyVisitor.prototype.visitExpression_definition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_call.
resourcePolicyVisitor.prototype.visitExpression_call = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_call_argument.
resourcePolicyVisitor.prototype.visitExpression_call_argument = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#environment_variable.
resourcePolicyVisitor.prototype.visitEnvironment_variable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_declaration.
resourcePolicyVisitor.prototype.visitContract_account_declaration = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_types.
resourcePolicyVisitor.prototype.visitContract_account_types = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_name.
resourcePolicyVisitor.prototype.visitContract_account_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#audience_clause.
resourcePolicyVisitor.prototype.visitAudience_clause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#state_definition_section.
resourcePolicyVisitor.prototype.visitState_definition_section = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#state_definition.
resourcePolicyVisitor.prototype.visitState_definition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#state_description.
resourcePolicyVisitor.prototype.visitState_description = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_description.
resourcePolicyVisitor.prototype.visitContract_account_description = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_state.
resourcePolicyVisitor.prototype.visitContract_account_state = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#state_transition.
resourcePolicyVisitor.prototype.visitState_transition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#account.
resourcePolicyVisitor.prototype.visitAccount = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#state_id.
resourcePolicyVisitor.prototype.visitState_id = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#proposer.
resourcePolicyVisitor.prototype.visitProposer = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#acceptor.
resourcePolicyVisitor.prototype.visitAcceptor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#currency_unit.
resourcePolicyVisitor.prototype.visitCurrency_unit = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#license_resource_id.
resourcePolicyVisitor.prototype.visitLicense_resource_id = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#users.
resourcePolicyVisitor.prototype.visitUsers = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#datetime.
resourcePolicyVisitor.prototype.visitDatetime = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#resource_id.
resourcePolicyVisitor.prototype.visitResource_id = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#event.
resourcePolicyVisitor.prototype.visitEvent = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#natural_event.
resourcePolicyVisitor.prototype.visitNatural_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#reservation_event.
resourcePolicyVisitor.prototype.visitReservation_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#custom_event.
resourcePolicyVisitor.prototype.visitCustom_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#contract_account_event.
resourcePolicyVisitor.prototype.visitContract_account_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#escrow_exceed_amount.
resourcePolicyVisitor.prototype.visitEscrow_exceed_amount = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#escrow_confiscated.
resourcePolicyVisitor.prototype.visitEscrow_confiscated = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#escrow_refunded.
resourcePolicyVisitor.prototype.visitEscrow_refunded = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#event_placeholder.
resourcePolicyVisitor.prototype.visitEvent_placeholder = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#and_event.
resourcePolicyVisitor.prototype.visitAnd_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#cycle_end_event.
resourcePolicyVisitor.prototype.visitCycle_end_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#time_event.
resourcePolicyVisitor.prototype.visitTime_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#relative_time_event.
resourcePolicyVisitor.prototype.visitRelative_time_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#elapsed.
resourcePolicyVisitor.prototype.visitElapsed = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#transaction_event.
resourcePolicyVisitor.prototype.visitTransaction_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#signing_event.
resourcePolicyVisitor.prototype.visitSigning_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#access_count_event.
resourcePolicyVisitor.prototype.visitAccess_count_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#settlement_event.
resourcePolicyVisitor.prototype.visitSettlement_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#recontract_count_event.
resourcePolicyVisitor.prototype.visitRecontract_count_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#present_count_event.
resourcePolicyVisitor.prototype.visitPresent_count_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#view_count_event.
resourcePolicyVisitor.prototype.visitView_count_event = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#amount.
resourcePolicyVisitor.prototype.visitAmount = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression_call_or_literal.
resourcePolicyVisitor.prototype.visitExpression_call_or_literal = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#expression.
resourcePolicyVisitor.prototype.visitExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#multiplyingExpression.
resourcePolicyVisitor.prototype.visitMultiplyingExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#powExpression.
resourcePolicyVisitor.prototype.visitPowExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#signedAtom.
resourcePolicyVisitor.prototype.visitSignedAtom = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#built_in_function.
resourcePolicyVisitor.prototype.visitBuilt_in_function = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#funcname.
resourcePolicyVisitor.prototype.visitFuncname = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#atom.
resourcePolicyVisitor.prototype.visitAtom = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#scientific.
resourcePolicyVisitor.prototype.visitScientific = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#constant.
resourcePolicyVisitor.prototype.visitConstant = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by resourcePolicyParser#variable.
resourcePolicyVisitor.prototype.visitVariable = function(ctx) {
  return this.visitChildren(ctx);
};



exports.resourcePolicyVisitor = resourcePolicyVisitor;