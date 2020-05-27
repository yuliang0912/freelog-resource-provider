var antlr4 = require('antlr4/index')
var resourcePolicyVisitor = require('../gen/resourcePolicyVisitor').resourcePolicyVisitor
var resourcePolicyListener = require('../gen/resourcePolicyListener').resourcePolicyListener
var event_def = require('freelog_event_definition/lib/event_definition')
var camelcase = require('camelcase')

class HighlightGenerator extends resourcePolicyVisitor {
  constructor() {
    super()
    // highlight
    this.curStateElements = []
    this.audienceElementsArr = []
    this.declarationElementArr = []
    this.stateElementsArr = []
    this.curStateTransition = ''
  }

  getFullRowString (ctx){
    return ctx.start.getInputStream().strdata.slice(ctx.start.start, ctx.stop.stop + 1)
  }

  getPolicyHighlightElements (tree){
    // super.visit(tree)
    var audientceElements = this.audienceElementsArr.join('')
    var declarationElements = this.declarationElementArr.join('')
    var stateElements = this.stateElementsArr.map(stateArr => {
      stateArr[1] = stateArr[1].join('')
      return stateArr.join('')
    }).join('')
    return `<div class="beauty-poliycy-box">
      ${audientceElements}
      ${declarationElements}
      ${stateElements}
    </div>`
  }

  getBeautifulPolicy (tree){

  }

  visitPolicy(ctx) {
    super.visitPolicy(ctx)
  }

  visitAudience_clause(ctx) {

    var audienceBody = this.getFullRowString(ctx)
    this.audienceElementsArr = [
      ...this.audienceElementsArr,
      `<div class="bp-audience" >for ${audienceBody}:</div>`
    ]

    super.visitAudience_clause(ctx)
  }

  visitDeclaration_statements(ctx) {
    super.visitDeclaration_statements(ctx)
  }

  visitExpression_declaration(ctx) {
    var expressBody = this.getFullRowString(ctx)
    this.declarationElementArr = [
      ...this.declarationElementArr,
      `<div class="bp-declaration contract-expression">
           ${expressBody}
        </div>`
    ]

    super.visitExpression_declaration(ctx)
  }

  visitContract_account_declaration(ctx) {
    var accountType = this.getFullRowString(ctx.getChild(0))
    var accountName = this.getFullRowString(ctx.getChild(1))
    this.declarationElementArr = [
      ...this.declarationElementArr,
      `<div class="bp-declaration contract-account">
           ${accountType} 
           <span class="accountname" >${accountName}</span>
        </div>`
    ]
    super.visitContract_account_declaration(ctx)
  }

  visitSingle_custom_event_declaration(ctx) {
    var eventName = this.getFullRowString(ctx)
    this.declarationElementArr = [
      ...this.declarationElementArr,
      `<div class="bp-declaration custom-event">
         custom event 
         <span class="custom-eventname" >${eventName}</span>
        </div>`
    ]
    super.visitSingle_custom_event_declaration(ctx)
  }

  visitState_definition(ctx) {
    var stateName = ctx.getChild(0).getText()

    var arr = [
      `<div class="bp-state bp-s-${stateName}">`,
      [],
      `</div>`
    ]
    this.stateElementsArr.push(arr)
    this.curStateElements = arr[1]
    this.curStateElements.push(`<div class="bp-s-row"><span class="bp-s-statename">${stateName}</span>:</div>`)

    super.visitState_definition(ctx)
  }

  visitState_description(ctx) {
    var stateDesription = ctx.getChild(0).getText()
    this.curStateElements.push(`<div class="bp-s-row"><span class="bp-s-description">${stateDesription}</span></div>`)

    super.visitState_description(ctx)
  }

  visitState_transition(ctx) {

    if(ctx.getChildCount() >= 4){
      let transition = ctx.getChild(2).getText()
      this.curStateTransition = transition
      this.curStateElements.push(`<div class="bp-s-row">proceed to <span class="bp-s-transition">${transition}</span> on `)
    }else{
      let transitionBody = this.getFullRowString(ctx)
      this.curStateElements.push(`<div class="bp-s-row">${transitionBody}</div>`)
    }

    super.visitState_transition(ctx)
  }

  visitEvent(ctx) {
    super.visitEvent(ctx)
  }

  visitCustom_event(ctx){
    var ruleName = 'Custom_event'
    var eventHandler = camelcase(ruleName)
    ruleName = ruleName.replace(/_/g, '-')
    var eventBody = this.getFullRowString(ctx)

    this.curStateElements.push(`<span class="bp-s-event s-${ruleName}" data-handler=="${eventHandler}"  data-transition="${this.curStateTransition}">${eventBody}</span>
      </div>`)
    super.visitCustom_event(ctx)
  }


  visitExpression_call(ctx) {
    super.visitExpression_call(ctx)
  }
}

var ruleName_to_functionName = (ruleName) => {
  return 'visit' + ruleName.charAt(0).toUpperCase() + ruleName.slice(1);
}

event_def
  .filter(event => event.singleton)
  .forEach((event, i) => {
    var ruleName = event['RuleName']
    let fnName =  'visit' + ruleName.charAt(0).toUpperCase() + ruleName.slice(1)

    HighlightGenerator.prototype[fnName] = function (ctx){

      var eventHandler = camelcase(ruleName)
      ruleName = ruleName.replace(/_/g, '-')
      var eventBody = this.getFullRowString(ctx)

      this.curStateElements.push(`<span class="bp-s-event bp-s-${ruleName}" data-transition="${this.curStateTransition}" data-handler="${eventHandler}">${eventBody}</span>
      </div>`)

    }
  })




exports.HighlightGenerator = HighlightGenerator
