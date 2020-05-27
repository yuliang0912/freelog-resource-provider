grammar expressionDefinition;

expression
   : multiplyingExpression ((PLUS | MINUS) multiplyingExpression)*
   ;

multiplyingExpression
   : powExpression ((TIMES | DIV) powExpression)*
   ;

powExpression
   : signedAtom (POW signedAtom)*
   ;

signedAtom
   : PLUS signedAtom
   | MINUS signedAtom
   | built_in_function
   | atom
   ;

built_in_function
  : funcname LPAREN expression (COMMA expression)* RPAREN
  ;

funcname
  : SUM
  ;


atom
  : scientific
  | constant
  | LPAREN expression RPAREN
  | INT
  | variable
  ;

scientific
  : SCIENTIFIC_NUMBER
  ;

constant
  : PI
  | EULER
  ;

variable : ID ;


LPAREN : '(' ;
RPAREN : ')' ;
PLUS : '+' ;
MINUS : '-' ;
TIMES : '*' ;
DIV : '/' ;
GT : '>' ;
LT : '<' ;
EQ : '=' ;
COMMA : ',' ;
POINT : '.' ;
POW : '^' ;
PI : 'pi' ;


SCIENTIFIC_NUMBER
   : NUMBER (('E' | 'e') SIGN? NUMBER)?
   ;

EULER : 'e' ;

SUM : 'sum' ;

fragment NUMBER
   : ('0' .. '9') + ('.' ('0' .. '9') +)?
   ;

fragment SIGN
   : ('+' | '-')
   ;
