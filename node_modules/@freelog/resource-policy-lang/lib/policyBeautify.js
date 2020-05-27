var antlr4 = require('antlr4')

var gen_dir = '../gen'
var BeautifyGenerator = require ('../lib/BeautifyGenerator').BeautifyGenerator
var resourcePolicyLexer = require (`../gen/resourcePolicyLexer`)
var resourcePolicyParser = require (`../gen/resourcePolicyParser`)
var camelcase = require('camelcase')

function beautifyPolicy (segmentText){
  var chars = new antlr4.InputStream(segmentText)
  var lexer = new resourcePolicyLexer.resourcePolicyLexer(chars)
  var tokens  = new antlr4.CommonTokenStream(lexer)
  var parser = new resourcePolicyParser.resourcePolicyParser(tokens)

  parser.buildParseTrees = true
  var tree = parser.policy()
  var gen = new BeautifyGenerator(1)
  gen.visit(tree)

  return gen.getBeautifulPolicy()
}


exports.beautifyPolicy = beautifyPolicy