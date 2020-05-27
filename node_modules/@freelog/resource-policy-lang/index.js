'use strict'

const antlr4 = require('antlr4/index')
const SMGenerator = require('./SMGenerator').SMGenerator
const resourcePolicyLexer = require('./gen/resourcePolicyLexer')
const resourcePolicyParser = require('./gen/resourcePolicyParser')
const PolicyErrorListener = require('./lib/policyErrorListener')
const highlightPolicy = require('./lib/presentablePolicyHighlight').highlightPolicy
const beautifyPolicy = require('./lib/policyBeautify').beautifyPolicy

module.exports.compile = function (policyText) {

    const errors = []
    const chars = new antlr4.InputStream(policyText);
    const lexer = new resourcePolicyLexer.resourcePolicyLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new resourcePolicyParser.resourcePolicyParser(tokens);
    const policyErrorListener = new PolicyErrorListener(errors)

    parser.buildParseTrees = true;
    parser.addErrorListener(policyErrorListener)

    const tree = parser.policy();
    const gen = new SMGenerator(errors);
    gen.visit(tree);

    return gen
}

module.exports.highlight = highlightPolicy
module.exports.beautify = beautifyPolicy