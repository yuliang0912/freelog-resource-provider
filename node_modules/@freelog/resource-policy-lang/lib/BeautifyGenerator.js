var antlr4 = require('antlr4/index')
var resourcePolicyVisitor = require('../gen/resourcePolicyVisitor').resourcePolicyVisitor
var resourcePolicyListener = require('../gen/resourcePolicyListener').resourcePolicyListener
var event_def = require('freelog_event_definition/lib/event_definition')
var camelcase = require('camelcase')

class BeautifyGenerator extends resourcePolicyVisitor {
  constructor() {
    super()

    // beautiy
    this.audienceClauseArr = []
    this.declarationRowsArr = []
    this.stateRowsArr = []

  }

  getFullRowString (ctx){
    return ctx.start.getInputStream().strdata.slice(ctx.start.start, ctx.stop.stop + 1)
  }

  getBeautifulPolicy (){
    if(this.declarationRowsArr.length !== 0){
      this.declarationRowsArr.push('')
    }
    var target = [...this.audienceClauseArr, ...this.declarationRowsArr, ...this.stateRowsArr ]

    return target.join('\n')

  }


  visitPolicy(ctx) {
    super.visitPolicy(ctx)
  }

  visitAudience_clause(ctx) {
    var audienceBody = this.getFullRowString(ctx)
    this.audienceClauseArr.push(`for ${audienceBody}:`)
    super.visitAudience_clause(ctx)
  }

  visitDeclaration_statements(ctx) {
    var rowString = this.getFullRowString(ctx)
    rowString = rowString.replace(/^(\s*)/, '  ')
    this.declarationRowsArr.push(rowString)
    super.visitDeclaration_statements(ctx)
  }

  visitState_definition(ctx) {
    var stateName = ctx.getChild(0).getText()
    stateName = `${stateName}:`
    stateName = stateName.replace(/^(\s*)/, '  ')
    this.stateRowsArr.push(stateName)
    super.visitState_definition(ctx)
  }

  visitState_description(ctx) {
    var stateDesription = ctx.getChild(0).getText()
    stateDesription = stateDesription.replace(/^(\s*)/, '    ')
    this.stateRowsArr.push(stateDesription)
    super.visitState_description(ctx)
  }

  visitState_transition(ctx) {

    var stateTransitionRowString = this.getFullRowString(ctx)
    stateTransitionRowString = stateTransitionRowString.replace(/^(\s*)/, '    ')
    this.stateRowsArr.push(stateTransitionRowString)
    super.visitState_transition(ctx)
  }

  visitEvent(ctx) {
    super.visitEvent(ctx)
  }

  visitExpression_call(ctx) {
    super.visitExpression_call(ctx)
  }
}





exports.BeautifyGenerator = BeautifyGenerator
