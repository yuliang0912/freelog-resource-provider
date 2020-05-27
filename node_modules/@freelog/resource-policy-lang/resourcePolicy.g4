grammar resourcePolicy;

import eventDefinition, expressionDefinition;

policy : (segment)* EOF;

segment : FOR audience_clause ':' declaration_section? state_definition_section
  ;

declaration_section: declaration_statements+
  ;

declaration_statements
  : custom_event_declaration
  | expression_declaration
  | contract_account_declaration
  ;

custom_event_declaration
  : 'custom' 'event' one_or_more_event_decl
  ;

one_or_more_event_decl
  : single_custom_event_declaration (',' single_custom_event_declaration)*
  ;

single_custom_event_declaration
  : custom_event_owner '.' custom_event_name
  ;

custom_event_name: ID ;

custom_event_owner : proposer | acceptor
  ;

expression_declaration : expression_handle '(' (ID (',' ID)*)* ')' '=' expression_definition;

expression_handle : ID ;

expression_definition : expression ;

expression_call : expression_handle '(' (expression_call_argument (',' expression_call_argument)*)* ')' ;

expression_call_argument
  : INT
  | environment_variable
  ;

environment_variable
  : 'presented_last_cycle'
  ;

contract_account_declaration
  : contract_account_types contract_account_name
  ;

contract_account_types
  : 'escrow' 'account'
  ;

contract_account_name : ID ;

audience_clause
  : users
  | audience_clause ','  audience_clause
  ;

state_definition_section
  :  state_definition+
  ;

state_definition
  : state_id ':' state_description* state_transition+
  ;

state_description
  : 'presentable'
  | 'recontractable'
  | 'active'
  | contract_account_description
  ;

contract_account_description
  : contract_account_name '.' contract_account_state
  ;

contract_account_state
  : 'confiscable'
  | 'refundable'
  ;

state_transition
  : 'proceed' 'to' state_id 'on' event
  | TERMINATE
  ;

account : FEATHERACCOUNT ;

state_id : ID ;

proposer: 'proposer';
acceptor: 'acceptor';

currency_unit : FEATHER | BARB ;

license_resource_id : resource_id;

users : SELF | NODES | PUBLIC | GROUPUSER | GROUPNODE | INT | ID;

datetime: DATE TIME;

resource_id : RESOURCE_ID_TOKEN { this._ctx.start._text = this._ctx.getText().substr(1) };

TIMEUNIT : C Y C L E S? | Y E A R S? | W E E K S? | D A Y S? | M O N T H S? ;

FOR: F O R;
SELF : S E L F;
GROUPUSER : G R O U P '_' U S E R '_' ID;
GROUPNODE : G R O U P '_' N O D E '_' ID;
NODES : N O D E S;
PUBLIC : P U B L I C;
TERMINATE : T E R M I N A T E;

fragment A : ('A'|'a');
fragment B : ('B'|'b');
fragment C : ('C'|'c');
fragment D : ('D'|'d');
fragment E : ('E'|'e');
fragment F : ('F'|'f');
fragment G : ('G'|'g');
fragment H : ('H'|'h');
fragment I : ('I'|'i');
fragment J : ('J'|'j');
fragment K : ('K'|'k');
fragment L : ('L'|'l');
fragment M : ('M'|'m');
fragment N : ('N'|'n');
fragment O : ('O'|'o');
fragment P : ('P'|'p');
fragment Q : ('Q'|'q');
fragment R : ('R'|'r');
fragment S : ('S'|'s');
fragment T : ('T'|'t');
fragment U : ('U'|'u');
fragment V : ('V'|'v');
fragment W : ('W'|'w');
fragment X : ('X'|'x');
fragment Y : ('Y'|'y');
fragment Z : ('Z'|'z');

fragment DIGIT : [0-9];
fragment ALPHABET : [a-zA-Z];
fragment HEX_ALPHABET : [a-fA-F];
fragment HEX_DIGIT : [0-9a-fA-F];

fragment AT  :   '@';

RESOURCE_ID_TOKEN : AT (HEX_DIGIT)+;

EVENT : 'event_' (DIGIT|ALPHABET)+;

FEATHER : 'feather' ;
BARB : 'barb' ;

INT:  DIGIT+;

TIME : TWO_DIGITS ':' TWO_DIGITS (':' TWO_DIGITS)?;
DATE : FOUR_DIGITS '-' TWO_DIGITS '-' TWO_DIGITS;

TWO_DIGITS : DIGIT DIGIT ;
FOUR_DIGITS : DIGIT DIGIT DIGIT DIGIT;
NIGHT_DIGITS : DIGIT DIGIT DIGIT DIGIT DIGIT DIGIT DIGIT DIGIT DIGIT;

ID
  : ALPHABET (ALPHABET | INT | '_' | '-')*
  ;

FEATHERACCOUNT : '$' (ALPHABET|DIGIT)+;

WS  : [ \t\r\n]+ -> skip;
