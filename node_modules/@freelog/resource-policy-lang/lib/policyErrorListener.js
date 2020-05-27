'use strict'

var antlr4 = require('antlr4/index')


module.exports = class PolicyErrorListener extends antlr4.error.ErrorListener {

    constructor(errors) {
        super()
        this.errors = errors
    }

    syntaxError(rec, sym, line, col, msg, e) {
        this.errors.push(`line:${line},col:${col},msg:${msg}`);
    }
}



