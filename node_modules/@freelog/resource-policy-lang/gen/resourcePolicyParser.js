// Generated from resourcePolicy.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');
var resourcePolicyListener = require('./resourcePolicyListener').resourcePolicyListener;
var resourcePolicyVisitor = require('./resourcePolicyVisitor').resourcePolicyVisitor;

var grammarFileName = "resourcePolicy.g4";

var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003G\u01d9\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004",
    "\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0004\u0014\t",
    "\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016\u0004\u0017\t\u0017\u0004",
    "\u0018\t\u0018\u0004\u0019\t\u0019\u0004\u001a\t\u001a\u0004\u001b\t",
    "\u001b\u0004\u001c\t\u001c\u0004\u001d\t\u001d\u0004\u001e\t\u001e\u0004",
    "\u001f\t\u001f\u0004 \t \u0004!\t!\u0004\"\t\"\u0004#\t#\u0004$\t$\u0004",
    "%\t%\u0004&\t&\u0004\'\t\'\u0004(\t(\u0004)\t)\u0004*\t*\u0004+\t+\u0004",
    ",\t,\u0004-\t-\u0004.\t.\u0004/\t/\u00040\t0\u00041\t1\u00042\t2\u0004",
    "3\t3\u00044\t4\u00045\t5\u00046\t6\u00047\t7\u00048\t8\u00049\t9\u0004",
    ":\t:\u0004;\t;\u0004<\t<\u0004=\t=\u0004>\t>\u0004?\t?\u0004@\t@\u0004",
    "A\tA\u0004B\tB\u0004C\tC\u0004D\tD\u0003\u0002\u0007\u0002\u008a\n\u0002",
    "\f\u0002\u000e\u0002\u008d\u000b\u0002\u0003\u0002\u0003\u0002\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003\u0095\n\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0004\u0006\u0004\u009a\n\u0004\r\u0004",
    "\u000e\u0004\u009b\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005\u00a1",
    "\n\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0007\u0007\u00aa\n\u0007\f\u0007\u000e\u0007",
    "\u00ad\u000b\u0007\u0003\b\u0003\b\u0003\b\u0003\b\u0003\t\u0003\t\u0003",
    "\n\u0003\n\u0005\n\u00b7\n\n\u0003\u000b\u0003\u000b\u0003\u000b\u0003",
    "\u000b\u0003\u000b\u0007\u000b\u00be\n\u000b\f\u000b\u000e\u000b\u00c1",
    "\u000b\u000b\u0007\u000b\u00c3\n\u000b\f\u000b\u000e\u000b\u00c6\u000b",
    "\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003\f\u0003",
    "\f\u0003\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003",
    "\u000e\u0007\u000e\u00d5\n\u000e\f\u000e\u000e\u000e\u00d8\u000b\u000e",
    "\u0007\u000e\u00da\n\u000e\f\u000e\u000e\u000e\u00dd\u000b\u000e\u0003",
    "\u000e\u0003\u000e\u0003\u000f\u0003\u000f\u0005\u000f\u00e3\n\u000f",
    "\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0012",
    "\u0003\u0012\u0003\u0012\u0003\u0013\u0003\u0013\u0003\u0014\u0003\u0014",
    "\u0003\u0014\u0003\u0014\u0003\u0014\u0003\u0014\u0007\u0014\u00f5\n",
    "\u0014\f\u0014\u000e\u0014\u00f8\u000b\u0014\u0003\u0015\u0006\u0015",
    "\u00fb\n\u0015\r\u0015\u000e\u0015\u00fc\u0003\u0016\u0003\u0016\u0003",
    "\u0016\u0007\u0016\u0102\n\u0016\f\u0016\u000e\u0016\u0105\u000b\u0016",
    "\u0003\u0016\u0006\u0016\u0108\n\u0016\r\u0016\u000e\u0016\u0109\u0003",
    "\u0017\u0003\u0017\u0003\u0017\u0003\u0017\u0005\u0017\u0110\n\u0017",
    "\u0003\u0018\u0003\u0018\u0003\u0018\u0003\u0018\u0003\u0019\u0003\u0019",
    "\u0003\u001a\u0003\u001a\u0003\u001a\u0003\u001a\u0003\u001a\u0003\u001a",
    "\u0003\u001a\u0005\u001a\u011f\n\u001a\u0003\u001b\u0003\u001b\u0003",
    "\u001c\u0003\u001c\u0003\u001d\u0003\u001d\u0003\u001e\u0003\u001e\u0003",
    "\u001f\u0003\u001f\u0003 \u0003 \u0003!\u0003!\u0003\"\u0003\"\u0003",
    "\"\u0003#\u0003#\u0003#\u0003$\u0003$\u0003$\u0003$\u0005$\u0139\n$",
    "\u0003%\u0003%\u0003%\u0003%\u0005%\u013f\n%\u0003&\u0003&\u0003&\u0003",
    "&\u0005&\u0145\n&\u0003\'\u0003\'\u0003\'\u0003\'\u0003(\u0003(\u0003",
    "(\u0005(\u014e\n(\u0003)\u0003)\u0003)\u0003)\u0003)\u0003*\u0003*\u0003",
    "*\u0003*\u0003+\u0003+\u0003+\u0003+\u0003,\u0003,\u0003-\u0003-\u0003",
    "-\u0003.\u0003.\u0003.\u0003.\u0003/\u0003/\u0003/\u00030\u00030\u0003",
    "0\u00030\u00031\u00031\u00032\u00032\u00032\u00032\u00032\u00033\u0003",
    "3\u00033\u00033\u00033\u00073\u0179\n3\f3\u000e3\u017c\u000b3\u0003",
    "4\u00034\u00034\u00054\u0181\n4\u00035\u00035\u00035\u00036\u00036\u0003",
    "6\u00036\u00036\u00037\u00037\u00037\u00037\u00037\u00038\u00038\u0003",
    "8\u00038\u00038\u00039\u00039\u0003:\u0003:\u0005:\u0199\n:\u0003;\u0003",
    ";\u0003;\u0007;\u019e\n;\f;\u000e;\u01a1\u000b;\u0003<\u0003<\u0003",
    "<\u0007<\u01a6\n<\f<\u000e<\u01a9\u000b<\u0003=\u0003=\u0003=\u0007",
    "=\u01ae\n=\f=\u000e=\u01b1\u000b=\u0003>\u0003>\u0003>\u0003>\u0003",
    ">\u0003>\u0005>\u01b9\n>\u0003?\u0003?\u0003?\u0003?\u0003?\u0007?\u01c0",
    "\n?\f?\u000e?\u01c3\u000b?\u0003?\u0003?\u0003@\u0003@\u0003A\u0003",
    "A\u0003A\u0003A\u0003A\u0003A\u0003A\u0003A\u0005A\u01d1\nA\u0003B\u0003",
    "B\u0003C\u0003C\u0003D\u0003D\u0003D\u0002\u0003&E\u0002\u0004\u0006",
    "\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e \"$&(*",
    ",.02468:<>@BDFHJLNPRTVXZ\\^`bdfhjlnprtvxz|~\u0080\u0082\u0084\u0086",
    "\u0002\b\u0003\u0002\f\r\u0003\u0002-.\u0005\u0002%)//55\u0003\u0002",
    ":;\u0003\u0002<=\u0004\u0002DDFF\u0002\u01c3\u0002\u008b\u0003\u0002",
    "\u0002\u0002\u0004\u0090\u0003\u0002\u0002\u0002\u0006\u0099\u0003\u0002",
    "\u0002\u0002\b\u00a0\u0003\u0002\u0002\u0002\n\u00a2\u0003\u0002\u0002",
    "\u0002\f\u00a6\u0003\u0002\u0002\u0002\u000e\u00ae\u0003\u0002\u0002",
    "\u0002\u0010\u00b2\u0003\u0002\u0002\u0002\u0012\u00b6\u0003\u0002\u0002",
    "\u0002\u0014\u00b8\u0003\u0002\u0002\u0002\u0016\u00cb\u0003\u0002\u0002",
    "\u0002\u0018\u00cd\u0003\u0002\u0002\u0002\u001a\u00cf\u0003\u0002\u0002",
    "\u0002\u001c\u00e2\u0003\u0002\u0002\u0002\u001e\u00e4\u0003\u0002\u0002",
    "\u0002 \u00e6\u0003\u0002\u0002\u0002\"\u00e9\u0003\u0002\u0002\u0002",
    "$\u00ec\u0003\u0002\u0002\u0002&\u00ee\u0003\u0002\u0002\u0002(\u00fa",
    "\u0003\u0002\u0002\u0002*\u00fe\u0003\u0002\u0002\u0002,\u010f\u0003",
    "\u0002\u0002\u0002.\u0111\u0003\u0002\u0002\u00020\u0115\u0003\u0002",
    "\u0002\u00022\u011e\u0003\u0002\u0002\u00024\u0120\u0003\u0002\u0002",
    "\u00026\u0122\u0003\u0002\u0002\u00028\u0124\u0003\u0002\u0002\u0002",
    ":\u0126\u0003\u0002\u0002\u0002<\u0128\u0003\u0002\u0002\u0002>\u012a",
    "\u0003\u0002\u0002\u0002@\u012c\u0003\u0002\u0002\u0002B\u012e\u0003",
    "\u0002\u0002\u0002D\u0131\u0003\u0002\u0002\u0002F\u0138\u0003\u0002",
    "\u0002\u0002H\u013e\u0003\u0002\u0002\u0002J\u0144\u0003\u0002\u0002",
    "\u0002L\u0146\u0003\u0002\u0002\u0002N\u014d\u0003\u0002\u0002\u0002",
    "P\u014f\u0003\u0002\u0002\u0002R\u0154\u0003\u0002\u0002\u0002T\u0158",
    "\u0003\u0002\u0002\u0002V\u015c\u0003\u0002\u0002\u0002X\u015e\u0003",
    "\u0002\u0002\u0002Z\u0161\u0003\u0002\u0002\u0002\\\u0165\u0003\u0002",
    "\u0002\u0002^\u0168\u0003\u0002\u0002\u0002`\u016c\u0003\u0002\u0002",
    "\u0002b\u016e\u0003\u0002\u0002\u0002d\u0173\u0003\u0002\u0002\u0002",
    "f\u0180\u0003\u0002\u0002\u0002h\u0182\u0003\u0002\u0002\u0002j\u0185",
    "\u0003\u0002\u0002\u0002l\u018a\u0003\u0002\u0002\u0002n\u018f\u0003",
    "\u0002\u0002\u0002p\u0194\u0003\u0002\u0002\u0002r\u0198\u0003\u0002",
    "\u0002\u0002t\u019a\u0003\u0002\u0002\u0002v\u01a2\u0003\u0002\u0002",
    "\u0002x\u01aa\u0003\u0002\u0002\u0002z\u01b8\u0003\u0002\u0002\u0002",
    "|\u01ba\u0003\u0002\u0002\u0002~\u01c6\u0003\u0002\u0002\u0002\u0080",
    "\u01d0\u0003\u0002\u0002\u0002\u0082\u01d2\u0003\u0002\u0002\u0002\u0084",
    "\u01d4\u0003\u0002\u0002\u0002\u0086\u01d6\u0003\u0002\u0002\u0002\u0088",
    "\u008a\u0005\u0004\u0003\u0002\u0089\u0088\u0003\u0002\u0002\u0002\u008a",
    "\u008d\u0003\u0002\u0002\u0002\u008b\u0089\u0003\u0002\u0002\u0002\u008b",
    "\u008c\u0003\u0002\u0002\u0002\u008c\u008e\u0003\u0002\u0002\u0002\u008d",
    "\u008b\u0003\u0002\u0002\u0002\u008e\u008f\u0007\u0002\u0002\u0003\u008f",
    "\u0003\u0003\u0002\u0002\u0002\u0090\u0091\u0007$\u0002\u0002\u0091",
    "\u0092\u0005&\u0014\u0002\u0092\u0094\u0007\u0003\u0002\u0002\u0093",
    "\u0095\u0005\u0006\u0004\u0002\u0094\u0093\u0003\u0002\u0002\u0002\u0094",
    "\u0095\u0003\u0002\u0002\u0002\u0095\u0096\u0003\u0002\u0002\u0002\u0096",
    "\u0097\u0005(\u0015\u0002\u0097\u0005\u0003\u0002\u0002\u0002\u0098",
    "\u009a\u0005\b\u0005\u0002\u0099\u0098\u0003\u0002\u0002\u0002\u009a",
    "\u009b\u0003\u0002\u0002\u0002\u009b\u0099\u0003\u0002\u0002\u0002\u009b",
    "\u009c\u0003\u0002\u0002\u0002\u009c\u0007\u0003\u0002\u0002\u0002\u009d",
    "\u00a1\u0005\n\u0006\u0002\u009e\u00a1\u0005\u0014\u000b\u0002\u009f",
    "\u00a1\u0005 \u0011\u0002\u00a0\u009d\u0003\u0002\u0002\u0002\u00a0",
    "\u009e\u0003\u0002\u0002\u0002\u00a0\u009f\u0003\u0002\u0002\u0002\u00a1",
    "\t\u0003\u0002\u0002\u0002\u00a2\u00a3\u0007\u0004\u0002\u0002\u00a3",
    "\u00a4\u0007\u0005\u0002\u0002\u00a4\u00a5\u0005\f\u0007\u0002\u00a5",
    "\u000b\u0003\u0002\u0002\u0002\u00a6\u00ab\u0005\u000e\b\u0002\u00a7",
    "\u00a8\u0007A\u0002\u0002\u00a8\u00aa\u0005\u000e\b\u0002\u00a9\u00a7",
    "\u0003\u0002\u0002\u0002\u00aa\u00ad\u0003\u0002\u0002\u0002\u00ab\u00a9",
    "\u0003\u0002\u0002\u0002\u00ab\u00ac\u0003\u0002\u0002\u0002\u00ac\r",
    "\u0003\u0002\u0002\u0002\u00ad\u00ab\u0003\u0002\u0002\u0002\u00ae\u00af",
    "\u0005\u0012\n\u0002\u00af\u00b0\u0007B\u0002\u0002\u00b0\u00b1\u0005",
    "\u0010\t\u0002\u00b1\u000f\u0003\u0002\u0002\u0002\u00b2\u00b3\u0007",
    "5\u0002\u0002\u00b3\u0011\u0003\u0002\u0002\u0002\u00b4\u00b7\u0005",
    "8\u001d\u0002\u00b5\u00b7\u0005:\u001e\u0002\u00b6\u00b4\u0003\u0002",
    "\u0002\u0002\u00b6\u00b5\u0003\u0002\u0002\u0002\u00b7\u0013\u0003\u0002",
    "\u0002\u0002\u00b8\u00b9\u0005\u0016\f\u0002\u00b9\u00c4\u00078\u0002",
    "\u0002\u00ba\u00bf\u00075\u0002\u0002\u00bb\u00bc\u0007A\u0002\u0002",
    "\u00bc\u00be\u00075\u0002\u0002\u00bd\u00bb\u0003\u0002\u0002\u0002",
    "\u00be\u00c1\u0003\u0002\u0002\u0002\u00bf\u00bd\u0003\u0002\u0002\u0002",
    "\u00bf\u00c0\u0003\u0002\u0002\u0002\u00c0\u00c3\u0003\u0002\u0002\u0002",
    "\u00c1\u00bf\u0003\u0002\u0002\u0002\u00c2\u00ba\u0003\u0002\u0002\u0002",
    "\u00c3\u00c6\u0003\u0002\u0002\u0002\u00c4\u00c2\u0003\u0002\u0002\u0002",
    "\u00c4\u00c5\u0003\u0002\u0002\u0002\u00c5\u00c7\u0003\u0002\u0002\u0002",
    "\u00c6\u00c4\u0003\u0002\u0002\u0002\u00c7\u00c8\u00079\u0002\u0002",
    "\u00c8\u00c9\u0007@\u0002\u0002\u00c9\u00ca\u0005\u0018\r\u0002\u00ca",
    "\u0015\u0003\u0002\u0002\u0002\u00cb\u00cc\u00075\u0002\u0002\u00cc",
    "\u0017\u0003\u0002\u0002\u0002\u00cd\u00ce\u0005t;\u0002\u00ce\u0019",
    "\u0003\u0002\u0002\u0002\u00cf\u00d0\u0005\u0016\f\u0002\u00d0\u00db",
    "\u00078\u0002\u0002\u00d1\u00d6\u0005\u001c\u000f\u0002\u00d2\u00d3",
    "\u0007A\u0002\u0002\u00d3\u00d5\u0005\u001c\u000f\u0002\u00d4\u00d2",
    "\u0003\u0002\u0002\u0002\u00d5\u00d8\u0003\u0002\u0002\u0002\u00d6\u00d4",
    "\u0003\u0002\u0002\u0002\u00d6\u00d7\u0003\u0002\u0002\u0002\u00d7\u00da",
    "\u0003\u0002\u0002\u0002\u00d8\u00d6\u0003\u0002\u0002\u0002\u00d9\u00d1",
    "\u0003\u0002\u0002\u0002\u00da\u00dd\u0003\u0002\u0002\u0002\u00db\u00d9",
    "\u0003\u0002\u0002\u0002\u00db\u00dc\u0003\u0002\u0002\u0002\u00dc\u00de",
    "\u0003\u0002\u0002\u0002\u00dd\u00db\u0003\u0002\u0002\u0002\u00de\u00df",
    "\u00079\u0002\u0002\u00df\u001b\u0003\u0002\u0002\u0002\u00e0\u00e3",
    "\u0007/\u0002\u0002\u00e1\u00e3\u0005\u001e\u0010\u0002\u00e2\u00e0",
    "\u0003\u0002\u0002\u0002\u00e2\u00e1\u0003\u0002\u0002\u0002\u00e3\u001d",
    "\u0003\u0002\u0002\u0002\u00e4\u00e5\u0007\u0006\u0002\u0002\u00e5\u001f",
    "\u0003\u0002\u0002\u0002\u00e6\u00e7\u0005\"\u0012\u0002\u00e7\u00e8",
    "\u0005$\u0013\u0002\u00e8!\u0003\u0002\u0002\u0002\u00e9\u00ea\u0007",
    "\u0007\u0002\u0002\u00ea\u00eb\u0007\b\u0002\u0002\u00eb#\u0003\u0002",
    "\u0002\u0002\u00ec\u00ed\u00075\u0002\u0002\u00ed%\u0003\u0002\u0002",
    "\u0002\u00ee\u00ef\b\u0014\u0001\u0002\u00ef\u00f0\u0005@!\u0002\u00f0",
    "\u00f6\u0003\u0002\u0002\u0002\u00f1\u00f2\f\u0003\u0002\u0002\u00f2",
    "\u00f3\u0007A\u0002\u0002\u00f3\u00f5\u0005&\u0014\u0004\u00f4\u00f1",
    "\u0003\u0002\u0002\u0002\u00f5\u00f8\u0003\u0002\u0002\u0002\u00f6\u00f4",
    "\u0003\u0002\u0002\u0002\u00f6\u00f7\u0003\u0002\u0002\u0002\u00f7\'",
    "\u0003\u0002\u0002\u0002\u00f8\u00f6\u0003\u0002\u0002\u0002\u00f9\u00fb",
    "\u0005*\u0016\u0002\u00fa\u00f9\u0003\u0002\u0002\u0002\u00fb\u00fc",
    "\u0003\u0002\u0002\u0002\u00fc\u00fa\u0003\u0002\u0002\u0002\u00fc\u00fd",
    "\u0003\u0002\u0002\u0002\u00fd)\u0003\u0002\u0002\u0002\u00fe\u00ff",
    "\u00056\u001c\u0002\u00ff\u0103\u0007\u0003\u0002\u0002\u0100\u0102",
    "\u0005,\u0017\u0002\u0101\u0100\u0003\u0002\u0002\u0002\u0102\u0105",
    "\u0003\u0002\u0002\u0002\u0103\u0101\u0003\u0002\u0002\u0002\u0103\u0104",
    "\u0003\u0002\u0002\u0002\u0104\u0107\u0003\u0002\u0002\u0002\u0105\u0103",
    "\u0003\u0002\u0002\u0002\u0106\u0108\u00052\u001a\u0002\u0107\u0106",
    "\u0003\u0002\u0002\u0002\u0108\u0109\u0003\u0002\u0002\u0002\u0109\u0107",
    "\u0003\u0002\u0002\u0002\u0109\u010a\u0003\u0002\u0002\u0002\u010a+",
    "\u0003\u0002\u0002\u0002\u010b\u0110\u0007\t\u0002\u0002\u010c\u0110",
    "\u0007\n\u0002\u0002\u010d\u0110\u0007\u000b\u0002\u0002\u010e\u0110",
    "\u0005.\u0018\u0002\u010f\u010b\u0003\u0002\u0002\u0002\u010f\u010c",
    "\u0003\u0002\u0002\u0002\u010f\u010d\u0003\u0002\u0002\u0002\u010f\u010e",
    "\u0003\u0002\u0002\u0002\u0110-\u0003\u0002\u0002\u0002\u0111\u0112",
    "\u0005$\u0013\u0002\u0112\u0113\u0007B\u0002\u0002\u0113\u0114\u0005",
    "0\u0019\u0002\u0114/\u0003\u0002\u0002\u0002\u0115\u0116\t\u0002\u0002",
    "\u0002\u01161\u0003\u0002\u0002\u0002\u0117\u0118\u0007\u000e\u0002",
    "\u0002\u0118\u0119\u0007\u000f\u0002\u0002\u0119\u011a\u00056\u001c",
    "\u0002\u011a\u011b\u0007\u0010\u0002\u0002\u011b\u011c\u0005F$\u0002",
    "\u011c\u011f\u0003\u0002\u0002\u0002\u011d\u011f\u0007*\u0002\u0002",
    "\u011e\u0117\u0003\u0002\u0002\u0002\u011e\u011d\u0003\u0002\u0002\u0002",
    "\u011f3\u0003\u0002\u0002\u0002\u0120\u0121\u00076\u0002\u0002\u0121",
    "5\u0003\u0002\u0002\u0002\u0122\u0123\u00075\u0002\u0002\u01237\u0003",
    "\u0002\u0002\u0002\u0124\u0125\u0007\u0011\u0002\u0002\u01259\u0003",
    "\u0002\u0002\u0002\u0126\u0127\u0007\u0012\u0002\u0002\u0127;\u0003",
    "\u0002\u0002\u0002\u0128\u0129\t\u0003\u0002\u0002\u0129=\u0003\u0002",
    "\u0002\u0002\u012a\u012b\u0005D#\u0002\u012b?\u0003\u0002\u0002\u0002",
    "\u012c\u012d\t\u0004\u0002\u0002\u012dA\u0003\u0002\u0002\u0002\u012e",
    "\u012f\u00071\u0002\u0002\u012f\u0130\u00070\u0002\u0002\u0130C\u0003",
    "\u0002\u0002\u0002\u0131\u0132\u0007+\u0002\u0002\u0132\u0133\b#\u0001",
    "\u0002\u0133E\u0003\u0002\u0002\u0002\u0134\u0139\u0005H%\u0002\u0135",
    "\u0139\u0005J&\u0002\u0136\u0139\u0005L\'\u0002\u0137\u0139\u0005V,",
    "\u0002\u0138\u0134\u0003\u0002\u0002\u0002\u0138\u0135\u0003\u0002\u0002",
    "\u0002\u0138\u0136\u0003\u0002\u0002\u0002\u0138\u0137\u0003\u0002\u0002",
    "\u0002\u0139G\u0003\u0002\u0002\u0002\u013a\u013f\u0005Z.\u0002\u013b",
    "\u013f\u0005d3\u0002\u013c\u013f\u0005b2\u0002\u013d\u013f\u0005h5\u0002",
    "\u013e\u013a\u0003\u0002\u0002\u0002\u013e\u013b\u0003\u0002\u0002\u0002",
    "\u013e\u013c\u0003\u0002\u0002\u0002\u013e\u013d\u0003\u0002\u0002\u0002",
    "\u013fI\u0003\u0002\u0002\u0002\u0140\u0145\u0005\\/\u0002\u0141\u0145",
    "\u0005^0\u0002\u0142\u0145\u0005f4\u0002\u0143\u0145\u0005N(\u0002\u0144",
    "\u0140\u0003\u0002\u0002\u0002\u0144\u0141\u0003\u0002\u0002\u0002\u0144",
    "\u0142\u0003\u0002\u0002\u0002\u0144\u0143\u0003\u0002\u0002\u0002\u0145",
    "K\u0003\u0002\u0002\u0002\u0146\u0147\u0005\u0012\n\u0002\u0147\u0148",
    "\u0007B\u0002\u0002\u0148\u0149\u0005\u0010\t\u0002\u0149M\u0003\u0002",
    "\u0002\u0002\u014a\u014e\u0005P)\u0002\u014b\u014e\u0005R*\u0002\u014c",
    "\u014e\u0005T+\u0002\u014d\u014a\u0003\u0002\u0002\u0002\u014d\u014b",
    "\u0003\u0002\u0002\u0002\u014d\u014c\u0003\u0002\u0002\u0002\u014eO",
    "\u0003\u0002\u0002\u0002\u014f\u0150\u0005$\u0013\u0002\u0150\u0151",
    "\u0007\u0013\u0002\u0002\u0151\u0152\u0005p9\u0002\u0152\u0153\u0005",
    "<\u001f\u0002\u0153Q\u0003\u0002\u0002\u0002\u0154\u0155\u0005$\u0013",
    "\u0002\u0155\u0156\u0007B\u0002\u0002\u0156\u0157\u0007\u0014\u0002",
    "\u0002\u0157S\u0003\u0002\u0002\u0002\u0158\u0159\u0005$\u0013\u0002",
    "\u0159\u015a\u0007B\u0002\u0002\u015a\u015b\u0007\u0015\u0002\u0002",
    "\u015bU\u0003\u0002\u0002\u0002\u015c\u015d\u0007,\u0002\u0002\u015d",
    "W\u0003\u0002\u0002\u0002\u015e\u015f\u0007\u0016\u0002\u0002\u015f",
    "\u0160\u0005F$\u0002\u0160Y\u0003\u0002\u0002\u0002\u0161\u0162\u0007",
    "\u0017\u0002\u0002\u0162\u0163\u0007\u0018\u0002\u0002\u0163\u0164\u0007",
    "#\u0002\u0002\u0164[\u0003\u0002\u0002\u0002\u0165\u0166\u0007\u0019",
    "\u0002\u0002\u0166\u0167\u0005B\"\u0002\u0167]\u0003\u0002\u0002\u0002",
    "\u0168\u0169\u0007\u001a\u0002\u0002\u0169\u016a\u0005`1\u0002\u016a",
    "\u016b\u0007#\u0002\u0002\u016b_\u0003\u0002\u0002\u0002\u016c\u016d",
    "\u0007/\u0002\u0002\u016da\u0003\u0002\u0002\u0002\u016e\u016f\u0007",
    "\u001b\u0002\u0002\u016f\u0170\u0005p9\u0002\u0170\u0171\u0007\u000f",
    "\u0002\u0002\u0171\u0172\u00054\u001b\u0002\u0172c\u0003\u0002\u0002",
    "\u0002\u0173\u0174\u0007\u001c\u0002\u0002\u0174\u0175\u0007\u001d\u0002",
    "\u0002\u0175\u017a\u0005> \u0002\u0176\u0177\u0007A\u0002\u0002\u0177",
    "\u0179\u0005> \u0002\u0178\u0176\u0003\u0002\u0002\u0002\u0179\u017c",
    "\u0003\u0002\u0002\u0002\u017a\u0178\u0003\u0002\u0002\u0002\u017a\u017b",
    "\u0003\u0002\u0002\u0002\u017be\u0003\u0002\u0002\u0002\u017c\u017a",
    "\u0003\u0002\u0002\u0002\u017d\u0181\u0005j6\u0002\u017e\u0181\u0005",
    "l7\u0002\u017f\u0181\u0005n8\u0002\u0180\u017d\u0003\u0002\u0002\u0002",
    "\u0180\u017e\u0003\u0002\u0002\u0002\u0180\u017f\u0003\u0002\u0002\u0002",
    "\u0181g\u0003\u0002\u0002\u0002\u0182\u0183\u00054\u001b\u0002\u0183",
    "\u0184\u0007\u001e\u0002\u0002\u0184i\u0003\u0002\u0002\u0002\u0185",
    "\u0186\u0005p9\u0002\u0186\u0187\u0007\u0018\u0002\u0002\u0187\u0188",
    "\u0007\u001f\u0002\u0002\u0188\u0189\u0007 \u0002\u0002\u0189k\u0003",
    "\u0002\u0002\u0002\u018a\u018b\u0005p9\u0002\u018b\u018c\u0007\u0018",
    "\u0002\u0002\u018c\u018d\u0007!\u0002\u0002\u018d\u018e\u0007 \u0002",
    "\u0002\u018em\u0003\u0002\u0002\u0002\u018f\u0190\u0005p9\u0002\u0190",
    "\u0191\u0007\u0018\u0002\u0002\u0191\u0192\u0007\"\u0002\u0002\u0192",
    "\u0193\u0007 \u0002\u0002\u0193o\u0003\u0002\u0002\u0002\u0194\u0195",
    "\u0005r:\u0002\u0195q\u0003\u0002\u0002\u0002\u0196\u0199\u0005\u001a",
    "\u000e\u0002\u0197\u0199\u0005t;\u0002\u0198\u0196\u0003\u0002\u0002",
    "\u0002\u0198\u0197\u0003\u0002\u0002\u0002\u0199s\u0003\u0002\u0002",
    "\u0002\u019a\u019f\u0005v<\u0002\u019b\u019c\t\u0005\u0002\u0002\u019c",
    "\u019e\u0005v<\u0002\u019d\u019b\u0003\u0002\u0002\u0002\u019e\u01a1",
    "\u0003\u0002\u0002\u0002\u019f\u019d\u0003\u0002\u0002\u0002\u019f\u01a0",
    "\u0003\u0002\u0002\u0002\u01a0u\u0003\u0002\u0002\u0002\u01a1\u019f",
    "\u0003\u0002\u0002\u0002\u01a2\u01a7\u0005x=\u0002\u01a3\u01a4\t\u0006",
    "\u0002\u0002\u01a4\u01a6\u0005x=\u0002\u01a5\u01a3\u0003\u0002\u0002",
    "\u0002\u01a6\u01a9\u0003\u0002\u0002\u0002\u01a7\u01a5\u0003\u0002\u0002",
    "\u0002\u01a7\u01a8\u0003\u0002\u0002\u0002\u01a8w\u0003\u0002\u0002",
    "\u0002\u01a9\u01a7\u0003\u0002\u0002\u0002\u01aa\u01af\u0005z>\u0002",
    "\u01ab\u01ac\u0007C\u0002\u0002\u01ac\u01ae\u0005z>\u0002\u01ad\u01ab",
    "\u0003\u0002\u0002\u0002\u01ae\u01b1\u0003\u0002\u0002\u0002\u01af\u01ad",
    "\u0003\u0002\u0002\u0002\u01af\u01b0\u0003\u0002\u0002\u0002\u01b0y",
    "\u0003\u0002\u0002\u0002\u01b1\u01af\u0003\u0002\u0002\u0002\u01b2\u01b3",
    "\u0007:\u0002\u0002\u01b3\u01b9\u0005z>\u0002\u01b4\u01b5\u0007;\u0002",
    "\u0002\u01b5\u01b9\u0005z>\u0002\u01b6\u01b9\u0005|?\u0002\u01b7\u01b9",
    "\u0005\u0080A\u0002\u01b8\u01b2\u0003\u0002\u0002\u0002\u01b8\u01b4",
    "\u0003\u0002\u0002\u0002\u01b8\u01b6\u0003\u0002\u0002\u0002\u01b8\u01b7",
    "\u0003\u0002\u0002\u0002\u01b9{\u0003\u0002\u0002\u0002\u01ba\u01bb",
    "\u0005~@\u0002\u01bb\u01bc\u00078\u0002\u0002\u01bc\u01c1\u0005t;\u0002",
    "\u01bd\u01be\u0007A\u0002\u0002\u01be\u01c0\u0005t;\u0002\u01bf\u01bd",
    "\u0003\u0002\u0002\u0002\u01c0\u01c3\u0003\u0002\u0002\u0002\u01c1\u01bf",
    "\u0003\u0002\u0002\u0002\u01c1\u01c2\u0003\u0002\u0002\u0002\u01c2\u01c4",
    "\u0003\u0002\u0002\u0002\u01c3\u01c1\u0003\u0002\u0002\u0002\u01c4\u01c5",
    "\u00079\u0002\u0002\u01c5}\u0003\u0002\u0002\u0002\u01c6\u01c7\u0007",
    "G\u0002\u0002\u01c7\u007f\u0003\u0002\u0002\u0002\u01c8\u01d1\u0005",
    "\u0082B\u0002\u01c9\u01d1\u0005\u0084C\u0002\u01ca\u01cb\u00078\u0002",
    "\u0002\u01cb\u01cc\u0005t;\u0002\u01cc\u01cd\u00079\u0002\u0002\u01cd",
    "\u01d1\u0003\u0002\u0002\u0002\u01ce\u01d1\u0007/\u0002\u0002\u01cf",
    "\u01d1\u0005\u0086D\u0002\u01d0\u01c8\u0003\u0002\u0002\u0002\u01d0",
    "\u01c9\u0003\u0002\u0002\u0002\u01d0\u01ca\u0003\u0002\u0002\u0002\u01d0",
    "\u01ce\u0003\u0002\u0002\u0002\u01d0\u01cf\u0003\u0002\u0002\u0002\u01d1",
    "\u0081\u0003\u0002\u0002\u0002\u01d2\u01d3\u0007E\u0002\u0002\u01d3",
    "\u0083\u0003\u0002\u0002\u0002\u01d4\u01d5\t\u0007\u0002\u0002\u01d5",
    "\u0085\u0003\u0002\u0002\u0002\u01d6\u01d7\u00075\u0002\u0002\u01d7",
    "\u0087\u0003\u0002\u0002\u0002 \u008b\u0094\u009b\u00a0\u00ab\u00b6",
    "\u00bf\u00c4\u00d6\u00db\u00e2\u00f6\u00fc\u0103\u0109\u010f\u011e\u0138",
    "\u013e\u0144\u014d\u017a\u0180\u0198\u019f\u01a7\u01af\u01b8\u01c1\u01d0"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "':'", "'custom'", "'event'", "'presented_last_cycle'", 
                     "'escrow'", "'account'", "'presentable'", "'recontractable'", 
                     "'active'", "'confiscable'", "'refundable'", "'proceed'", 
                     "'to'", "'on'", "'proposer'", "'acceptor'", "'exceed'", 
                     "'confiscated'", "'refunded'", "'and'", "'end'", "'of'", 
                     "'at'", "'after'", "'receiving'", "'accepting'", "'agreement'", 
                     "'settled'", "'recontractions'", "'reached'", "'presentations'", 
                     "'views'", null, null, null, null, null, null, null, 
                     null, null, null, "'feather'", "'barb'", null, null, 
                     null, null, null, null, null, null, null, "'('", "')'", 
                     "'+'", "'-'", "'*'", "'/'", "'>'", "'<'", "'='", "','", 
                     "'.'", "'^'", "'pi'", null, "'e'", "'sum'" ];

var symbolicNames = [ null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, "TIMEUNIT", "FOR", 
                      "SELF", "GROUPUSER", "GROUPNODE", "NODES", "PUBLIC", 
                      "TERMINATE", "RESOURCE_ID_TOKEN", "EVENT", "FEATHER", 
                      "BARB", "INT", "TIME", "DATE", "TWO_DIGITS", "FOUR_DIGITS", 
                      "NIGHT_DIGITS", "ID", "FEATHERACCOUNT", "WS", "LPAREN", 
                      "RPAREN", "PLUS", "MINUS", "TIMES", "DIV", "GT", "LT", 
                      "EQ", "COMMA", "POINT", "POW", "PI", "SCIENTIFIC_NUMBER", 
                      "EULER", "SUM" ];

var ruleNames =  [ "policy", "segment", "declaration_section", "declaration_statements", 
                   "custom_event_declaration", "one_or_more_event_decl", 
                   "single_custom_event_declaration", "custom_event_name", 
                   "custom_event_owner", "expression_declaration", "expression_handle", 
                   "expression_definition", "expression_call", "expression_call_argument", 
                   "environment_variable", "contract_account_declaration", 
                   "contract_account_types", "contract_account_name", "audience_clause", 
                   "state_definition_section", "state_definition", "state_description", 
                   "contract_account_description", "contract_account_state", 
                   "state_transition", "account", "state_id", "proposer", 
                   "acceptor", "currency_unit", "license_resource_id", "users", 
                   "datetime", "resource_id", "event", "natural_event", 
                   "reservation_event", "custom_event", "contract_account_event", 
                   "escrow_exceed_amount", "escrow_confiscated", "escrow_refunded", 
                   "event_placeholder", "and_event", "cycle_end_event", 
                   "time_event", "relative_time_event", "elapsed", "transaction_event", 
                   "signing_event", "access_count_event", "settlement_event", 
                   "recontract_count_event", "present_count_event", "view_count_event", 
                   "amount", "expression_call_or_literal", "expression", 
                   "multiplyingExpression", "powExpression", "signedAtom", 
                   "built_in_function", "funcname", "atom", "scientific", 
                   "constant", "variable" ];

function resourcePolicyParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

resourcePolicyParser.prototype = Object.create(antlr4.Parser.prototype);
resourcePolicyParser.prototype.constructor = resourcePolicyParser;

Object.defineProperty(resourcePolicyParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

resourcePolicyParser.EOF = antlr4.Token.EOF;
resourcePolicyParser.T__0 = 1;
resourcePolicyParser.T__1 = 2;
resourcePolicyParser.T__2 = 3;
resourcePolicyParser.T__3 = 4;
resourcePolicyParser.T__4 = 5;
resourcePolicyParser.T__5 = 6;
resourcePolicyParser.T__6 = 7;
resourcePolicyParser.T__7 = 8;
resourcePolicyParser.T__8 = 9;
resourcePolicyParser.T__9 = 10;
resourcePolicyParser.T__10 = 11;
resourcePolicyParser.T__11 = 12;
resourcePolicyParser.T__12 = 13;
resourcePolicyParser.T__13 = 14;
resourcePolicyParser.T__14 = 15;
resourcePolicyParser.T__15 = 16;
resourcePolicyParser.T__16 = 17;
resourcePolicyParser.T__17 = 18;
resourcePolicyParser.T__18 = 19;
resourcePolicyParser.T__19 = 20;
resourcePolicyParser.T__20 = 21;
resourcePolicyParser.T__21 = 22;
resourcePolicyParser.T__22 = 23;
resourcePolicyParser.T__23 = 24;
resourcePolicyParser.T__24 = 25;
resourcePolicyParser.T__25 = 26;
resourcePolicyParser.T__26 = 27;
resourcePolicyParser.T__27 = 28;
resourcePolicyParser.T__28 = 29;
resourcePolicyParser.T__29 = 30;
resourcePolicyParser.T__30 = 31;
resourcePolicyParser.T__31 = 32;
resourcePolicyParser.TIMEUNIT = 33;
resourcePolicyParser.FOR = 34;
resourcePolicyParser.SELF = 35;
resourcePolicyParser.GROUPUSER = 36;
resourcePolicyParser.GROUPNODE = 37;
resourcePolicyParser.NODES = 38;
resourcePolicyParser.PUBLIC = 39;
resourcePolicyParser.TERMINATE = 40;
resourcePolicyParser.RESOURCE_ID_TOKEN = 41;
resourcePolicyParser.EVENT = 42;
resourcePolicyParser.FEATHER = 43;
resourcePolicyParser.BARB = 44;
resourcePolicyParser.INT = 45;
resourcePolicyParser.TIME = 46;
resourcePolicyParser.DATE = 47;
resourcePolicyParser.TWO_DIGITS = 48;
resourcePolicyParser.FOUR_DIGITS = 49;
resourcePolicyParser.NIGHT_DIGITS = 50;
resourcePolicyParser.ID = 51;
resourcePolicyParser.FEATHERACCOUNT = 52;
resourcePolicyParser.WS = 53;
resourcePolicyParser.LPAREN = 54;
resourcePolicyParser.RPAREN = 55;
resourcePolicyParser.PLUS = 56;
resourcePolicyParser.MINUS = 57;
resourcePolicyParser.TIMES = 58;
resourcePolicyParser.DIV = 59;
resourcePolicyParser.GT = 60;
resourcePolicyParser.LT = 61;
resourcePolicyParser.EQ = 62;
resourcePolicyParser.COMMA = 63;
resourcePolicyParser.POINT = 64;
resourcePolicyParser.POW = 65;
resourcePolicyParser.PI = 66;
resourcePolicyParser.SCIENTIFIC_NUMBER = 67;
resourcePolicyParser.EULER = 68;
resourcePolicyParser.SUM = 69;

resourcePolicyParser.RULE_policy = 0;
resourcePolicyParser.RULE_segment = 1;
resourcePolicyParser.RULE_declaration_section = 2;
resourcePolicyParser.RULE_declaration_statements = 3;
resourcePolicyParser.RULE_custom_event_declaration = 4;
resourcePolicyParser.RULE_one_or_more_event_decl = 5;
resourcePolicyParser.RULE_single_custom_event_declaration = 6;
resourcePolicyParser.RULE_custom_event_name = 7;
resourcePolicyParser.RULE_custom_event_owner = 8;
resourcePolicyParser.RULE_expression_declaration = 9;
resourcePolicyParser.RULE_expression_handle = 10;
resourcePolicyParser.RULE_expression_definition = 11;
resourcePolicyParser.RULE_expression_call = 12;
resourcePolicyParser.RULE_expression_call_argument = 13;
resourcePolicyParser.RULE_environment_variable = 14;
resourcePolicyParser.RULE_contract_account_declaration = 15;
resourcePolicyParser.RULE_contract_account_types = 16;
resourcePolicyParser.RULE_contract_account_name = 17;
resourcePolicyParser.RULE_audience_clause = 18;
resourcePolicyParser.RULE_state_definition_section = 19;
resourcePolicyParser.RULE_state_definition = 20;
resourcePolicyParser.RULE_state_description = 21;
resourcePolicyParser.RULE_contract_account_description = 22;
resourcePolicyParser.RULE_contract_account_state = 23;
resourcePolicyParser.RULE_state_transition = 24;
resourcePolicyParser.RULE_account = 25;
resourcePolicyParser.RULE_state_id = 26;
resourcePolicyParser.RULE_proposer = 27;
resourcePolicyParser.RULE_acceptor = 28;
resourcePolicyParser.RULE_currency_unit = 29;
resourcePolicyParser.RULE_license_resource_id = 30;
resourcePolicyParser.RULE_users = 31;
resourcePolicyParser.RULE_datetime = 32;
resourcePolicyParser.RULE_resource_id = 33;
resourcePolicyParser.RULE_event = 34;
resourcePolicyParser.RULE_natural_event = 35;
resourcePolicyParser.RULE_reservation_event = 36;
resourcePolicyParser.RULE_custom_event = 37;
resourcePolicyParser.RULE_contract_account_event = 38;
resourcePolicyParser.RULE_escrow_exceed_amount = 39;
resourcePolicyParser.RULE_escrow_confiscated = 40;
resourcePolicyParser.RULE_escrow_refunded = 41;
resourcePolicyParser.RULE_event_placeholder = 42;
resourcePolicyParser.RULE_and_event = 43;
resourcePolicyParser.RULE_cycle_end_event = 44;
resourcePolicyParser.RULE_time_event = 45;
resourcePolicyParser.RULE_relative_time_event = 46;
resourcePolicyParser.RULE_elapsed = 47;
resourcePolicyParser.RULE_transaction_event = 48;
resourcePolicyParser.RULE_signing_event = 49;
resourcePolicyParser.RULE_access_count_event = 50;
resourcePolicyParser.RULE_settlement_event = 51;
resourcePolicyParser.RULE_recontract_count_event = 52;
resourcePolicyParser.RULE_present_count_event = 53;
resourcePolicyParser.RULE_view_count_event = 54;
resourcePolicyParser.RULE_amount = 55;
resourcePolicyParser.RULE_expression_call_or_literal = 56;
resourcePolicyParser.RULE_expression = 57;
resourcePolicyParser.RULE_multiplyingExpression = 58;
resourcePolicyParser.RULE_powExpression = 59;
resourcePolicyParser.RULE_signedAtom = 60;
resourcePolicyParser.RULE_built_in_function = 61;
resourcePolicyParser.RULE_funcname = 62;
resourcePolicyParser.RULE_atom = 63;
resourcePolicyParser.RULE_scientific = 64;
resourcePolicyParser.RULE_constant = 65;
resourcePolicyParser.RULE_variable = 66;

function PolicyContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_policy;
    return this;
}

PolicyContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PolicyContext.prototype.constructor = PolicyContext;

PolicyContext.prototype.EOF = function() {
    return this.getToken(resourcePolicyParser.EOF, 0);
};

PolicyContext.prototype.segment = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SegmentContext);
    } else {
        return this.getTypedRuleContext(SegmentContext,i);
    }
};

PolicyContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterPolicy(this);
	}
};

PolicyContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitPolicy(this);
	}
};

PolicyContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitPolicy(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.PolicyContext = PolicyContext;

resourcePolicyParser.prototype.policy = function() {

    var localctx = new PolicyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, resourcePolicyParser.RULE_policy);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 137;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.FOR) {
            this.state = 134;
            this.segment();
            this.state = 139;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 140;
        this.match(resourcePolicyParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SegmentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_segment;
    return this;
}

SegmentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SegmentContext.prototype.constructor = SegmentContext;

SegmentContext.prototype.FOR = function() {
    return this.getToken(resourcePolicyParser.FOR, 0);
};

SegmentContext.prototype.audience_clause = function() {
    return this.getTypedRuleContext(Audience_clauseContext,0);
};

SegmentContext.prototype.state_definition_section = function() {
    return this.getTypedRuleContext(State_definition_sectionContext,0);
};

SegmentContext.prototype.declaration_section = function() {
    return this.getTypedRuleContext(Declaration_sectionContext,0);
};

SegmentContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterSegment(this);
	}
};

SegmentContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitSegment(this);
	}
};

SegmentContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitSegment(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.SegmentContext = SegmentContext;

resourcePolicyParser.prototype.segment = function() {

    var localctx = new SegmentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, resourcePolicyParser.RULE_segment);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 142;
        this.match(resourcePolicyParser.FOR);
        this.state = 143;
        this.audience_clause(0);
        this.state = 144;
        this.match(resourcePolicyParser.T__0);
        this.state = 146;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
        if(la_===1) {
            this.state = 145;
            this.declaration_section();

        }
        this.state = 148;
        this.state_definition_section();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Declaration_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_declaration_section;
    return this;
}

Declaration_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Declaration_sectionContext.prototype.constructor = Declaration_sectionContext;

Declaration_sectionContext.prototype.declaration_statements = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Declaration_statementsContext);
    } else {
        return this.getTypedRuleContext(Declaration_statementsContext,i);
    }
};

Declaration_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterDeclaration_section(this);
	}
};

Declaration_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitDeclaration_section(this);
	}
};

Declaration_sectionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitDeclaration_section(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Declaration_sectionContext = Declaration_sectionContext;

resourcePolicyParser.prototype.declaration_section = function() {

    var localctx = new Declaration_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, resourcePolicyParser.RULE_declaration_section);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 151; 
        this._errHandler.sync(this);
        var _alt = 1;
        do {
        	switch (_alt) {
        	case 1:
        		this.state = 150;
        		this.declaration_statements();
        		break;
        	default:
        		throw new antlr4.error.NoViableAltException(this);
        	}
        	this.state = 153; 
        	this._errHandler.sync(this);
        	_alt = this._interp.adaptivePredict(this._input,2, this._ctx);
        } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Declaration_statementsContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_declaration_statements;
    return this;
}

Declaration_statementsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Declaration_statementsContext.prototype.constructor = Declaration_statementsContext;

Declaration_statementsContext.prototype.custom_event_declaration = function() {
    return this.getTypedRuleContext(Custom_event_declarationContext,0);
};

Declaration_statementsContext.prototype.expression_declaration = function() {
    return this.getTypedRuleContext(Expression_declarationContext,0);
};

Declaration_statementsContext.prototype.contract_account_declaration = function() {
    return this.getTypedRuleContext(Contract_account_declarationContext,0);
};

Declaration_statementsContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterDeclaration_statements(this);
	}
};

Declaration_statementsContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitDeclaration_statements(this);
	}
};

Declaration_statementsContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitDeclaration_statements(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Declaration_statementsContext = Declaration_statementsContext;

resourcePolicyParser.prototype.declaration_statements = function() {

    var localctx = new Declaration_statementsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, resourcePolicyParser.RULE_declaration_statements);
    try {
        this.state = 158;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__1:
            this.enterOuterAlt(localctx, 1);
            this.state = 155;
            this.custom_event_declaration();
            break;
        case resourcePolicyParser.ID:
            this.enterOuterAlt(localctx, 2);
            this.state = 156;
            this.expression_declaration();
            break;
        case resourcePolicyParser.T__4:
            this.enterOuterAlt(localctx, 3);
            this.state = 157;
            this.contract_account_declaration();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Custom_event_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_custom_event_declaration;
    return this;
}

Custom_event_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Custom_event_declarationContext.prototype.constructor = Custom_event_declarationContext;

Custom_event_declarationContext.prototype.one_or_more_event_decl = function() {
    return this.getTypedRuleContext(One_or_more_event_declContext,0);
};

Custom_event_declarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCustom_event_declaration(this);
	}
};

Custom_event_declarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCustom_event_declaration(this);
	}
};

Custom_event_declarationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCustom_event_declaration(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Custom_event_declarationContext = Custom_event_declarationContext;

resourcePolicyParser.prototype.custom_event_declaration = function() {

    var localctx = new Custom_event_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, resourcePolicyParser.RULE_custom_event_declaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 160;
        this.match(resourcePolicyParser.T__1);
        this.state = 161;
        this.match(resourcePolicyParser.T__2);
        this.state = 162;
        this.one_or_more_event_decl();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function One_or_more_event_declContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_one_or_more_event_decl;
    return this;
}

One_or_more_event_declContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
One_or_more_event_declContext.prototype.constructor = One_or_more_event_declContext;

One_or_more_event_declContext.prototype.single_custom_event_declaration = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Single_custom_event_declarationContext);
    } else {
        return this.getTypedRuleContext(Single_custom_event_declarationContext,i);
    }
};

One_or_more_event_declContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterOne_or_more_event_decl(this);
	}
};

One_or_more_event_declContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitOne_or_more_event_decl(this);
	}
};

One_or_more_event_declContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitOne_or_more_event_decl(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.One_or_more_event_declContext = One_or_more_event_declContext;

resourcePolicyParser.prototype.one_or_more_event_decl = function() {

    var localctx = new One_or_more_event_declContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, resourcePolicyParser.RULE_one_or_more_event_decl);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 164;
        this.single_custom_event_declaration();
        this.state = 169;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.COMMA) {
            this.state = 165;
            this.match(resourcePolicyParser.COMMA);
            this.state = 166;
            this.single_custom_event_declaration();
            this.state = 171;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Single_custom_event_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_single_custom_event_declaration;
    return this;
}

Single_custom_event_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Single_custom_event_declarationContext.prototype.constructor = Single_custom_event_declarationContext;

Single_custom_event_declarationContext.prototype.custom_event_owner = function() {
    return this.getTypedRuleContext(Custom_event_ownerContext,0);
};

Single_custom_event_declarationContext.prototype.custom_event_name = function() {
    return this.getTypedRuleContext(Custom_event_nameContext,0);
};

Single_custom_event_declarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterSingle_custom_event_declaration(this);
	}
};

Single_custom_event_declarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitSingle_custom_event_declaration(this);
	}
};

Single_custom_event_declarationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitSingle_custom_event_declaration(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Single_custom_event_declarationContext = Single_custom_event_declarationContext;

resourcePolicyParser.prototype.single_custom_event_declaration = function() {

    var localctx = new Single_custom_event_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, resourcePolicyParser.RULE_single_custom_event_declaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 172;
        this.custom_event_owner();
        this.state = 173;
        this.match(resourcePolicyParser.POINT);
        this.state = 174;
        this.custom_event_name();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Custom_event_nameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_custom_event_name;
    return this;
}

Custom_event_nameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Custom_event_nameContext.prototype.constructor = Custom_event_nameContext;

Custom_event_nameContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

Custom_event_nameContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCustom_event_name(this);
	}
};

Custom_event_nameContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCustom_event_name(this);
	}
};

Custom_event_nameContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCustom_event_name(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Custom_event_nameContext = Custom_event_nameContext;

resourcePolicyParser.prototype.custom_event_name = function() {

    var localctx = new Custom_event_nameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, resourcePolicyParser.RULE_custom_event_name);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 176;
        this.match(resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Custom_event_ownerContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_custom_event_owner;
    return this;
}

Custom_event_ownerContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Custom_event_ownerContext.prototype.constructor = Custom_event_ownerContext;

Custom_event_ownerContext.prototype.proposer = function() {
    return this.getTypedRuleContext(ProposerContext,0);
};

Custom_event_ownerContext.prototype.acceptor = function() {
    return this.getTypedRuleContext(AcceptorContext,0);
};

Custom_event_ownerContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCustom_event_owner(this);
	}
};

Custom_event_ownerContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCustom_event_owner(this);
	}
};

Custom_event_ownerContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCustom_event_owner(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Custom_event_ownerContext = Custom_event_ownerContext;

resourcePolicyParser.prototype.custom_event_owner = function() {

    var localctx = new Custom_event_ownerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, resourcePolicyParser.RULE_custom_event_owner);
    try {
        this.state = 180;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__14:
            this.enterOuterAlt(localctx, 1);
            this.state = 178;
            this.proposer();
            break;
        case resourcePolicyParser.T__15:
            this.enterOuterAlt(localctx, 2);
            this.state = 179;
            this.acceptor();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_declaration;
    return this;
}

Expression_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_declarationContext.prototype.constructor = Expression_declarationContext;

Expression_declarationContext.prototype.expression_handle = function() {
    return this.getTypedRuleContext(Expression_handleContext,0);
};

Expression_declarationContext.prototype.expression_definition = function() {
    return this.getTypedRuleContext(Expression_definitionContext,0);
};

Expression_declarationContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.ID);
    } else {
        return this.getToken(resourcePolicyParser.ID, i);
    }
};


Expression_declarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_declaration(this);
	}
};

Expression_declarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_declaration(this);
	}
};

Expression_declarationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_declaration(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_declarationContext = Expression_declarationContext;

resourcePolicyParser.prototype.expression_declaration = function() {

    var localctx = new Expression_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, resourcePolicyParser.RULE_expression_declaration);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 182;
        this.expression_handle();
        this.state = 183;
        this.match(resourcePolicyParser.LPAREN);
        this.state = 194;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.ID) {
            this.state = 184;
            this.match(resourcePolicyParser.ID);
            this.state = 189;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===resourcePolicyParser.COMMA) {
                this.state = 185;
                this.match(resourcePolicyParser.COMMA);
                this.state = 186;
                this.match(resourcePolicyParser.ID);
                this.state = 191;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 196;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 197;
        this.match(resourcePolicyParser.RPAREN);
        this.state = 198;
        this.match(resourcePolicyParser.EQ);
        this.state = 199;
        this.expression_definition();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_handleContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_handle;
    return this;
}

Expression_handleContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_handleContext.prototype.constructor = Expression_handleContext;

Expression_handleContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

Expression_handleContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_handle(this);
	}
};

Expression_handleContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_handle(this);
	}
};

Expression_handleContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_handle(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_handleContext = Expression_handleContext;

resourcePolicyParser.prototype.expression_handle = function() {

    var localctx = new Expression_handleContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, resourcePolicyParser.RULE_expression_handle);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 201;
        this.match(resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_definitionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_definition;
    return this;
}

Expression_definitionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_definitionContext.prototype.constructor = Expression_definitionContext;

Expression_definitionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

Expression_definitionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_definition(this);
	}
};

Expression_definitionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_definition(this);
	}
};

Expression_definitionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_definition(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_definitionContext = Expression_definitionContext;

resourcePolicyParser.prototype.expression_definition = function() {

    var localctx = new Expression_definitionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, resourcePolicyParser.RULE_expression_definition);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 203;
        this.expression();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_callContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_call;
    return this;
}

Expression_callContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_callContext.prototype.constructor = Expression_callContext;

Expression_callContext.prototype.expression_handle = function() {
    return this.getTypedRuleContext(Expression_handleContext,0);
};

Expression_callContext.prototype.expression_call_argument = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Expression_call_argumentContext);
    } else {
        return this.getTypedRuleContext(Expression_call_argumentContext,i);
    }
};

Expression_callContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_call(this);
	}
};

Expression_callContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_call(this);
	}
};

Expression_callContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_call(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_callContext = Expression_callContext;

resourcePolicyParser.prototype.expression_call = function() {

    var localctx = new Expression_callContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, resourcePolicyParser.RULE_expression_call);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 205;
        this.expression_handle();
        this.state = 206;
        this.match(resourcePolicyParser.LPAREN);
        this.state = 217;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.T__3 || _la===resourcePolicyParser.INT) {
            this.state = 207;
            this.expression_call_argument();
            this.state = 212;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===resourcePolicyParser.COMMA) {
                this.state = 208;
                this.match(resourcePolicyParser.COMMA);
                this.state = 209;
                this.expression_call_argument();
                this.state = 214;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 219;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 220;
        this.match(resourcePolicyParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_call_argumentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_call_argument;
    return this;
}

Expression_call_argumentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_call_argumentContext.prototype.constructor = Expression_call_argumentContext;

Expression_call_argumentContext.prototype.INT = function() {
    return this.getToken(resourcePolicyParser.INT, 0);
};

Expression_call_argumentContext.prototype.environment_variable = function() {
    return this.getTypedRuleContext(Environment_variableContext,0);
};

Expression_call_argumentContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_call_argument(this);
	}
};

Expression_call_argumentContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_call_argument(this);
	}
};

Expression_call_argumentContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_call_argument(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_call_argumentContext = Expression_call_argumentContext;

resourcePolicyParser.prototype.expression_call_argument = function() {

    var localctx = new Expression_call_argumentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, resourcePolicyParser.RULE_expression_call_argument);
    try {
        this.state = 224;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.INT:
            this.enterOuterAlt(localctx, 1);
            this.state = 222;
            this.match(resourcePolicyParser.INT);
            break;
        case resourcePolicyParser.T__3:
            this.enterOuterAlt(localctx, 2);
            this.state = 223;
            this.environment_variable();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Environment_variableContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_environment_variable;
    return this;
}

Environment_variableContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Environment_variableContext.prototype.constructor = Environment_variableContext;


Environment_variableContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEnvironment_variable(this);
	}
};

Environment_variableContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEnvironment_variable(this);
	}
};

Environment_variableContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEnvironment_variable(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Environment_variableContext = Environment_variableContext;

resourcePolicyParser.prototype.environment_variable = function() {

    var localctx = new Environment_variableContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, resourcePolicyParser.RULE_environment_variable);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 226;
        this.match(resourcePolicyParser.T__3);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_declarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_declaration;
    return this;
}

Contract_account_declarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_declarationContext.prototype.constructor = Contract_account_declarationContext;

Contract_account_declarationContext.prototype.contract_account_types = function() {
    return this.getTypedRuleContext(Contract_account_typesContext,0);
};

Contract_account_declarationContext.prototype.contract_account_name = function() {
    return this.getTypedRuleContext(Contract_account_nameContext,0);
};

Contract_account_declarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_declaration(this);
	}
};

Contract_account_declarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_declaration(this);
	}
};

Contract_account_declarationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_declaration(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_declarationContext = Contract_account_declarationContext;

resourcePolicyParser.prototype.contract_account_declaration = function() {

    var localctx = new Contract_account_declarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, resourcePolicyParser.RULE_contract_account_declaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 228;
        this.contract_account_types();
        this.state = 229;
        this.contract_account_name();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_typesContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_types;
    return this;
}

Contract_account_typesContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_typesContext.prototype.constructor = Contract_account_typesContext;


Contract_account_typesContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_types(this);
	}
};

Contract_account_typesContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_types(this);
	}
};

Contract_account_typesContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_types(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_typesContext = Contract_account_typesContext;

resourcePolicyParser.prototype.contract_account_types = function() {

    var localctx = new Contract_account_typesContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, resourcePolicyParser.RULE_contract_account_types);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 231;
        this.match(resourcePolicyParser.T__4);
        this.state = 232;
        this.match(resourcePolicyParser.T__5);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_nameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_name;
    return this;
}

Contract_account_nameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_nameContext.prototype.constructor = Contract_account_nameContext;

Contract_account_nameContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

Contract_account_nameContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_name(this);
	}
};

Contract_account_nameContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_name(this);
	}
};

Contract_account_nameContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_name(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_nameContext = Contract_account_nameContext;

resourcePolicyParser.prototype.contract_account_name = function() {

    var localctx = new Contract_account_nameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 34, resourcePolicyParser.RULE_contract_account_name);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 234;
        this.match(resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Audience_clauseContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_audience_clause;
    return this;
}

Audience_clauseContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Audience_clauseContext.prototype.constructor = Audience_clauseContext;

Audience_clauseContext.prototype.users = function() {
    return this.getTypedRuleContext(UsersContext,0);
};

Audience_clauseContext.prototype.audience_clause = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Audience_clauseContext);
    } else {
        return this.getTypedRuleContext(Audience_clauseContext,i);
    }
};

Audience_clauseContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAudience_clause(this);
	}
};

Audience_clauseContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAudience_clause(this);
	}
};

Audience_clauseContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAudience_clause(this);
    } else {
        return visitor.visitChildren(this);
    }
};



resourcePolicyParser.prototype.audience_clause = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new Audience_clauseContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 36;
    this.enterRecursionRule(localctx, 36, resourcePolicyParser.RULE_audience_clause, _p);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 237;
        this.users();
        this._ctx.stop = this._input.LT(-1);
        this.state = 244;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,11,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                localctx = new Audience_clauseContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(localctx, _startState, resourcePolicyParser.RULE_audience_clause);
                this.state = 239;
                if (!( this.precpred(this._ctx, 1))) {
                    throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                }
                this.state = 240;
                this.match(resourcePolicyParser.COMMA);
                this.state = 241;
                this.audience_clause(2); 
            }
            this.state = 246;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,11,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function State_definition_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_state_definition_section;
    return this;
}

State_definition_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
State_definition_sectionContext.prototype.constructor = State_definition_sectionContext;

State_definition_sectionContext.prototype.state_definition = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(State_definitionContext);
    } else {
        return this.getTypedRuleContext(State_definitionContext,i);
    }
};

State_definition_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterState_definition_section(this);
	}
};

State_definition_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitState_definition_section(this);
	}
};

State_definition_sectionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitState_definition_section(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.State_definition_sectionContext = State_definition_sectionContext;

resourcePolicyParser.prototype.state_definition_section = function() {

    var localctx = new State_definition_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 38, resourcePolicyParser.RULE_state_definition_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 248; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 247;
            this.state_definition();
            this.state = 250; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(_la===resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function State_definitionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_state_definition;
    return this;
}

State_definitionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
State_definitionContext.prototype.constructor = State_definitionContext;

State_definitionContext.prototype.state_id = function() {
    return this.getTypedRuleContext(State_idContext,0);
};

State_definitionContext.prototype.state_description = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(State_descriptionContext);
    } else {
        return this.getTypedRuleContext(State_descriptionContext,i);
    }
};

State_definitionContext.prototype.state_transition = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(State_transitionContext);
    } else {
        return this.getTypedRuleContext(State_transitionContext,i);
    }
};

State_definitionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterState_definition(this);
	}
};

State_definitionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitState_definition(this);
	}
};

State_definitionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitState_definition(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.State_definitionContext = State_definitionContext;

resourcePolicyParser.prototype.state_definition = function() {

    var localctx = new State_definitionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 40, resourcePolicyParser.RULE_state_definition);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 252;
        this.state_id();
        this.state = 253;
        this.match(resourcePolicyParser.T__0);
        this.state = 257;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << resourcePolicyParser.T__6) | (1 << resourcePolicyParser.T__7) | (1 << resourcePolicyParser.T__8))) !== 0) || _la===resourcePolicyParser.ID) {
            this.state = 254;
            this.state_description();
            this.state = 259;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 261; 
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
            this.state = 260;
            this.state_transition();
            this.state = 263; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        } while(_la===resourcePolicyParser.T__11 || _la===resourcePolicyParser.TERMINATE);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function State_descriptionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_state_description;
    return this;
}

State_descriptionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
State_descriptionContext.prototype.constructor = State_descriptionContext;

State_descriptionContext.prototype.contract_account_description = function() {
    return this.getTypedRuleContext(Contract_account_descriptionContext,0);
};

State_descriptionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterState_description(this);
	}
};

State_descriptionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitState_description(this);
	}
};

State_descriptionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitState_description(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.State_descriptionContext = State_descriptionContext;

resourcePolicyParser.prototype.state_description = function() {

    var localctx = new State_descriptionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 42, resourcePolicyParser.RULE_state_description);
    try {
        this.state = 269;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__6:
            this.enterOuterAlt(localctx, 1);
            this.state = 265;
            this.match(resourcePolicyParser.T__6);
            break;
        case resourcePolicyParser.T__7:
            this.enterOuterAlt(localctx, 2);
            this.state = 266;
            this.match(resourcePolicyParser.T__7);
            break;
        case resourcePolicyParser.T__8:
            this.enterOuterAlt(localctx, 3);
            this.state = 267;
            this.match(resourcePolicyParser.T__8);
            break;
        case resourcePolicyParser.ID:
            this.enterOuterAlt(localctx, 4);
            this.state = 268;
            this.contract_account_description();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_descriptionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_description;
    return this;
}

Contract_account_descriptionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_descriptionContext.prototype.constructor = Contract_account_descriptionContext;

Contract_account_descriptionContext.prototype.contract_account_name = function() {
    return this.getTypedRuleContext(Contract_account_nameContext,0);
};

Contract_account_descriptionContext.prototype.contract_account_state = function() {
    return this.getTypedRuleContext(Contract_account_stateContext,0);
};

Contract_account_descriptionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_description(this);
	}
};

Contract_account_descriptionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_description(this);
	}
};

Contract_account_descriptionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_description(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_descriptionContext = Contract_account_descriptionContext;

resourcePolicyParser.prototype.contract_account_description = function() {

    var localctx = new Contract_account_descriptionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 44, resourcePolicyParser.RULE_contract_account_description);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 271;
        this.contract_account_name();
        this.state = 272;
        this.match(resourcePolicyParser.POINT);
        this.state = 273;
        this.contract_account_state();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_stateContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_state;
    return this;
}

Contract_account_stateContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_stateContext.prototype.constructor = Contract_account_stateContext;


Contract_account_stateContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_state(this);
	}
};

Contract_account_stateContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_state(this);
	}
};

Contract_account_stateContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_state(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_stateContext = Contract_account_stateContext;

resourcePolicyParser.prototype.contract_account_state = function() {

    var localctx = new Contract_account_stateContext(this, this._ctx, this.state);
    this.enterRule(localctx, 46, resourcePolicyParser.RULE_contract_account_state);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 275;
        _la = this._input.LA(1);
        if(!(_la===resourcePolicyParser.T__9 || _la===resourcePolicyParser.T__10)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function State_transitionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_state_transition;
    return this;
}

State_transitionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
State_transitionContext.prototype.constructor = State_transitionContext;

State_transitionContext.prototype.state_id = function() {
    return this.getTypedRuleContext(State_idContext,0);
};

State_transitionContext.prototype.event = function() {
    return this.getTypedRuleContext(EventContext,0);
};

State_transitionContext.prototype.TERMINATE = function() {
    return this.getToken(resourcePolicyParser.TERMINATE, 0);
};

State_transitionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterState_transition(this);
	}
};

State_transitionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitState_transition(this);
	}
};

State_transitionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitState_transition(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.State_transitionContext = State_transitionContext;

resourcePolicyParser.prototype.state_transition = function() {

    var localctx = new State_transitionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 48, resourcePolicyParser.RULE_state_transition);
    try {
        this.state = 284;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__11:
            this.enterOuterAlt(localctx, 1);
            this.state = 277;
            this.match(resourcePolicyParser.T__11);
            this.state = 278;
            this.match(resourcePolicyParser.T__12);
            this.state = 279;
            this.state_id();
            this.state = 280;
            this.match(resourcePolicyParser.T__13);
            this.state = 281;
            this.event();
            break;
        case resourcePolicyParser.TERMINATE:
            this.enterOuterAlt(localctx, 2);
            this.state = 283;
            this.match(resourcePolicyParser.TERMINATE);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AccountContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_account;
    return this;
}

AccountContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AccountContext.prototype.constructor = AccountContext;

AccountContext.prototype.FEATHERACCOUNT = function() {
    return this.getToken(resourcePolicyParser.FEATHERACCOUNT, 0);
};

AccountContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAccount(this);
	}
};

AccountContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAccount(this);
	}
};

AccountContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAccount(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.AccountContext = AccountContext;

resourcePolicyParser.prototype.account = function() {

    var localctx = new AccountContext(this, this._ctx, this.state);
    this.enterRule(localctx, 50, resourcePolicyParser.RULE_account);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 286;
        this.match(resourcePolicyParser.FEATHERACCOUNT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function State_idContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_state_id;
    return this;
}

State_idContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
State_idContext.prototype.constructor = State_idContext;

State_idContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

State_idContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterState_id(this);
	}
};

State_idContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitState_id(this);
	}
};

State_idContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitState_id(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.State_idContext = State_idContext;

resourcePolicyParser.prototype.state_id = function() {

    var localctx = new State_idContext(this, this._ctx, this.state);
    this.enterRule(localctx, 52, resourcePolicyParser.RULE_state_id);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 288;
        this.match(resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ProposerContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_proposer;
    return this;
}

ProposerContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ProposerContext.prototype.constructor = ProposerContext;


ProposerContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterProposer(this);
	}
};

ProposerContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitProposer(this);
	}
};

ProposerContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitProposer(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.ProposerContext = ProposerContext;

resourcePolicyParser.prototype.proposer = function() {

    var localctx = new ProposerContext(this, this._ctx, this.state);
    this.enterRule(localctx, 54, resourcePolicyParser.RULE_proposer);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 290;
        this.match(resourcePolicyParser.T__14);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AcceptorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_acceptor;
    return this;
}

AcceptorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AcceptorContext.prototype.constructor = AcceptorContext;


AcceptorContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAcceptor(this);
	}
};

AcceptorContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAcceptor(this);
	}
};

AcceptorContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAcceptor(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.AcceptorContext = AcceptorContext;

resourcePolicyParser.prototype.acceptor = function() {

    var localctx = new AcceptorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 56, resourcePolicyParser.RULE_acceptor);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 292;
        this.match(resourcePolicyParser.T__15);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Currency_unitContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_currency_unit;
    return this;
}

Currency_unitContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Currency_unitContext.prototype.constructor = Currency_unitContext;

Currency_unitContext.prototype.FEATHER = function() {
    return this.getToken(resourcePolicyParser.FEATHER, 0);
};

Currency_unitContext.prototype.BARB = function() {
    return this.getToken(resourcePolicyParser.BARB, 0);
};

Currency_unitContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCurrency_unit(this);
	}
};

Currency_unitContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCurrency_unit(this);
	}
};

Currency_unitContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCurrency_unit(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Currency_unitContext = Currency_unitContext;

resourcePolicyParser.prototype.currency_unit = function() {

    var localctx = new Currency_unitContext(this, this._ctx, this.state);
    this.enterRule(localctx, 58, resourcePolicyParser.RULE_currency_unit);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 294;
        _la = this._input.LA(1);
        if(!(_la===resourcePolicyParser.FEATHER || _la===resourcePolicyParser.BARB)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function License_resource_idContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_license_resource_id;
    return this;
}

License_resource_idContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
License_resource_idContext.prototype.constructor = License_resource_idContext;

License_resource_idContext.prototype.resource_id = function() {
    return this.getTypedRuleContext(Resource_idContext,0);
};

License_resource_idContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterLicense_resource_id(this);
	}
};

License_resource_idContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitLicense_resource_id(this);
	}
};

License_resource_idContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitLicense_resource_id(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.License_resource_idContext = License_resource_idContext;

resourcePolicyParser.prototype.license_resource_id = function() {

    var localctx = new License_resource_idContext(this, this._ctx, this.state);
    this.enterRule(localctx, 60, resourcePolicyParser.RULE_license_resource_id);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 296;
        this.resource_id();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function UsersContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_users;
    return this;
}

UsersContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UsersContext.prototype.constructor = UsersContext;

UsersContext.prototype.SELF = function() {
    return this.getToken(resourcePolicyParser.SELF, 0);
};

UsersContext.prototype.NODES = function() {
    return this.getToken(resourcePolicyParser.NODES, 0);
};

UsersContext.prototype.PUBLIC = function() {
    return this.getToken(resourcePolicyParser.PUBLIC, 0);
};

UsersContext.prototype.GROUPUSER = function() {
    return this.getToken(resourcePolicyParser.GROUPUSER, 0);
};

UsersContext.prototype.GROUPNODE = function() {
    return this.getToken(resourcePolicyParser.GROUPNODE, 0);
};

UsersContext.prototype.INT = function() {
    return this.getToken(resourcePolicyParser.INT, 0);
};

UsersContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

UsersContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterUsers(this);
	}
};

UsersContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitUsers(this);
	}
};

UsersContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitUsers(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.UsersContext = UsersContext;

resourcePolicyParser.prototype.users = function() {

    var localctx = new UsersContext(this, this._ctx, this.state);
    this.enterRule(localctx, 62, resourcePolicyParser.RULE_users);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 298;
        _la = this._input.LA(1);
        if(!(((((_la - 35)) & ~0x1f) == 0 && ((1 << (_la - 35)) & ((1 << (resourcePolicyParser.SELF - 35)) | (1 << (resourcePolicyParser.GROUPUSER - 35)) | (1 << (resourcePolicyParser.GROUPNODE - 35)) | (1 << (resourcePolicyParser.NODES - 35)) | (1 << (resourcePolicyParser.PUBLIC - 35)) | (1 << (resourcePolicyParser.INT - 35)) | (1 << (resourcePolicyParser.ID - 35)))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function DatetimeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_datetime;
    return this;
}

DatetimeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DatetimeContext.prototype.constructor = DatetimeContext;

DatetimeContext.prototype.DATE = function() {
    return this.getToken(resourcePolicyParser.DATE, 0);
};

DatetimeContext.prototype.TIME = function() {
    return this.getToken(resourcePolicyParser.TIME, 0);
};

DatetimeContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterDatetime(this);
	}
};

DatetimeContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitDatetime(this);
	}
};

DatetimeContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitDatetime(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.DatetimeContext = DatetimeContext;

resourcePolicyParser.prototype.datetime = function() {

    var localctx = new DatetimeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 64, resourcePolicyParser.RULE_datetime);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 300;
        this.match(resourcePolicyParser.DATE);
        this.state = 301;
        this.match(resourcePolicyParser.TIME);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Resource_idContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_resource_id;
    return this;
}

Resource_idContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Resource_idContext.prototype.constructor = Resource_idContext;

Resource_idContext.prototype.RESOURCE_ID_TOKEN = function() {
    return this.getToken(resourcePolicyParser.RESOURCE_ID_TOKEN, 0);
};

Resource_idContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterResource_id(this);
	}
};

Resource_idContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitResource_id(this);
	}
};

Resource_idContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitResource_id(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Resource_idContext = Resource_idContext;

resourcePolicyParser.prototype.resource_id = function() {

    var localctx = new Resource_idContext(this, this._ctx, this.state);
    this.enterRule(localctx, 66, resourcePolicyParser.RULE_resource_id);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 303;
        this.match(resourcePolicyParser.RESOURCE_ID_TOKEN);
         this._ctx.start._text = this._ctx.getText().substr(1) 
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function EventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_event;
    return this;
}

EventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
EventContext.prototype.constructor = EventContext;

EventContext.prototype.natural_event = function() {
    return this.getTypedRuleContext(Natural_eventContext,0);
};

EventContext.prototype.reservation_event = function() {
    return this.getTypedRuleContext(Reservation_eventContext,0);
};

EventContext.prototype.custom_event = function() {
    return this.getTypedRuleContext(Custom_eventContext,0);
};

EventContext.prototype.event_placeholder = function() {
    return this.getTypedRuleContext(Event_placeholderContext,0);
};

EventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEvent(this);
	}
};

EventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEvent(this);
	}
};

EventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEvent(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.EventContext = EventContext;

resourcePolicyParser.prototype.event = function() {

    var localctx = new EventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 68, resourcePolicyParser.RULE_event);
    try {
        this.state = 310;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__20:
        case resourcePolicyParser.T__24:
        case resourcePolicyParser.T__25:
        case resourcePolicyParser.FEATHERACCOUNT:
            this.enterOuterAlt(localctx, 1);
            this.state = 306;
            this.natural_event();
            break;
        case resourcePolicyParser.T__22:
        case resourcePolicyParser.T__23:
        case resourcePolicyParser.INT:
        case resourcePolicyParser.ID:
        case resourcePolicyParser.LPAREN:
        case resourcePolicyParser.PLUS:
        case resourcePolicyParser.MINUS:
        case resourcePolicyParser.PI:
        case resourcePolicyParser.SCIENTIFIC_NUMBER:
        case resourcePolicyParser.EULER:
        case resourcePolicyParser.SUM:
            this.enterOuterAlt(localctx, 2);
            this.state = 307;
            this.reservation_event();
            break;
        case resourcePolicyParser.T__14:
        case resourcePolicyParser.T__15:
            this.enterOuterAlt(localctx, 3);
            this.state = 308;
            this.custom_event();
            break;
        case resourcePolicyParser.EVENT:
            this.enterOuterAlt(localctx, 4);
            this.state = 309;
            this.event_placeholder();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Natural_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_natural_event;
    return this;
}

Natural_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Natural_eventContext.prototype.constructor = Natural_eventContext;

Natural_eventContext.prototype.cycle_end_event = function() {
    return this.getTypedRuleContext(Cycle_end_eventContext,0);
};

Natural_eventContext.prototype.signing_event = function() {
    return this.getTypedRuleContext(Signing_eventContext,0);
};

Natural_eventContext.prototype.transaction_event = function() {
    return this.getTypedRuleContext(Transaction_eventContext,0);
};

Natural_eventContext.prototype.settlement_event = function() {
    return this.getTypedRuleContext(Settlement_eventContext,0);
};

Natural_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterNatural_event(this);
	}
};

Natural_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitNatural_event(this);
	}
};

Natural_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitNatural_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Natural_eventContext = Natural_eventContext;

resourcePolicyParser.prototype.natural_event = function() {

    var localctx = new Natural_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 70, resourcePolicyParser.RULE_natural_event);
    try {
        this.state = 316;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.T__20:
            this.enterOuterAlt(localctx, 1);
            this.state = 312;
            this.cycle_end_event();
            break;
        case resourcePolicyParser.T__25:
            this.enterOuterAlt(localctx, 2);
            this.state = 313;
            this.signing_event();
            break;
        case resourcePolicyParser.T__24:
            this.enterOuterAlt(localctx, 3);
            this.state = 314;
            this.transaction_event();
            break;
        case resourcePolicyParser.FEATHERACCOUNT:
            this.enterOuterAlt(localctx, 4);
            this.state = 315;
            this.settlement_event();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Reservation_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_reservation_event;
    return this;
}

Reservation_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Reservation_eventContext.prototype.constructor = Reservation_eventContext;

Reservation_eventContext.prototype.time_event = function() {
    return this.getTypedRuleContext(Time_eventContext,0);
};

Reservation_eventContext.prototype.relative_time_event = function() {
    return this.getTypedRuleContext(Relative_time_eventContext,0);
};

Reservation_eventContext.prototype.access_count_event = function() {
    return this.getTypedRuleContext(Access_count_eventContext,0);
};

Reservation_eventContext.prototype.contract_account_event = function() {
    return this.getTypedRuleContext(Contract_account_eventContext,0);
};

Reservation_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterReservation_event(this);
	}
};

Reservation_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitReservation_event(this);
	}
};

Reservation_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitReservation_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Reservation_eventContext = Reservation_eventContext;

resourcePolicyParser.prototype.reservation_event = function() {

    var localctx = new Reservation_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 72, resourcePolicyParser.RULE_reservation_event);
    try {
        this.state = 322;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,19,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 318;
            this.time_event();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 319;
            this.relative_time_event();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 320;
            this.access_count_event();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 321;
            this.contract_account_event();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Custom_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_custom_event;
    return this;
}

Custom_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Custom_eventContext.prototype.constructor = Custom_eventContext;

Custom_eventContext.prototype.custom_event_owner = function() {
    return this.getTypedRuleContext(Custom_event_ownerContext,0);
};

Custom_eventContext.prototype.custom_event_name = function() {
    return this.getTypedRuleContext(Custom_event_nameContext,0);
};

Custom_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCustom_event(this);
	}
};

Custom_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCustom_event(this);
	}
};

Custom_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCustom_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Custom_eventContext = Custom_eventContext;

resourcePolicyParser.prototype.custom_event = function() {

    var localctx = new Custom_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 74, resourcePolicyParser.RULE_custom_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 324;
        this.custom_event_owner();
        this.state = 325;
        this.match(resourcePolicyParser.POINT);
        this.state = 326;
        this.custom_event_name();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Contract_account_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_contract_account_event;
    return this;
}

Contract_account_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Contract_account_eventContext.prototype.constructor = Contract_account_eventContext;

Contract_account_eventContext.prototype.escrow_exceed_amount = function() {
    return this.getTypedRuleContext(Escrow_exceed_amountContext,0);
};

Contract_account_eventContext.prototype.escrow_confiscated = function() {
    return this.getTypedRuleContext(Escrow_confiscatedContext,0);
};

Contract_account_eventContext.prototype.escrow_refunded = function() {
    return this.getTypedRuleContext(Escrow_refundedContext,0);
};

Contract_account_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterContract_account_event(this);
	}
};

Contract_account_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitContract_account_event(this);
	}
};

Contract_account_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitContract_account_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Contract_account_eventContext = Contract_account_eventContext;

resourcePolicyParser.prototype.contract_account_event = function() {

    var localctx = new Contract_account_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 76, resourcePolicyParser.RULE_contract_account_event);
    try {
        this.state = 331;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,20,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 328;
            this.escrow_exceed_amount();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 329;
            this.escrow_confiscated();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 330;
            this.escrow_refunded();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Escrow_exceed_amountContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_escrow_exceed_amount;
    return this;
}

Escrow_exceed_amountContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Escrow_exceed_amountContext.prototype.constructor = Escrow_exceed_amountContext;

Escrow_exceed_amountContext.prototype.contract_account_name = function() {
    return this.getTypedRuleContext(Contract_account_nameContext,0);
};

Escrow_exceed_amountContext.prototype.amount = function() {
    return this.getTypedRuleContext(AmountContext,0);
};

Escrow_exceed_amountContext.prototype.currency_unit = function() {
    return this.getTypedRuleContext(Currency_unitContext,0);
};

Escrow_exceed_amountContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEscrow_exceed_amount(this);
	}
};

Escrow_exceed_amountContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEscrow_exceed_amount(this);
	}
};

Escrow_exceed_amountContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEscrow_exceed_amount(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Escrow_exceed_amountContext = Escrow_exceed_amountContext;

resourcePolicyParser.prototype.escrow_exceed_amount = function() {

    var localctx = new Escrow_exceed_amountContext(this, this._ctx, this.state);
    this.enterRule(localctx, 78, resourcePolicyParser.RULE_escrow_exceed_amount);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 333;
        this.contract_account_name();
        this.state = 334;
        this.match(resourcePolicyParser.T__16);
        this.state = 335;
        this.amount();
        this.state = 336;
        this.currency_unit();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Escrow_confiscatedContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_escrow_confiscated;
    return this;
}

Escrow_confiscatedContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Escrow_confiscatedContext.prototype.constructor = Escrow_confiscatedContext;

Escrow_confiscatedContext.prototype.contract_account_name = function() {
    return this.getTypedRuleContext(Contract_account_nameContext,0);
};

Escrow_confiscatedContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEscrow_confiscated(this);
	}
};

Escrow_confiscatedContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEscrow_confiscated(this);
	}
};

Escrow_confiscatedContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEscrow_confiscated(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Escrow_confiscatedContext = Escrow_confiscatedContext;

resourcePolicyParser.prototype.escrow_confiscated = function() {

    var localctx = new Escrow_confiscatedContext(this, this._ctx, this.state);
    this.enterRule(localctx, 80, resourcePolicyParser.RULE_escrow_confiscated);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 338;
        this.contract_account_name();
        this.state = 339;
        this.match(resourcePolicyParser.POINT);
        this.state = 340;
        this.match(resourcePolicyParser.T__17);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Escrow_refundedContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_escrow_refunded;
    return this;
}

Escrow_refundedContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Escrow_refundedContext.prototype.constructor = Escrow_refundedContext;

Escrow_refundedContext.prototype.contract_account_name = function() {
    return this.getTypedRuleContext(Contract_account_nameContext,0);
};

Escrow_refundedContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEscrow_refunded(this);
	}
};

Escrow_refundedContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEscrow_refunded(this);
	}
};

Escrow_refundedContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEscrow_refunded(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Escrow_refundedContext = Escrow_refundedContext;

resourcePolicyParser.prototype.escrow_refunded = function() {

    var localctx = new Escrow_refundedContext(this, this._ctx, this.state);
    this.enterRule(localctx, 82, resourcePolicyParser.RULE_escrow_refunded);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 342;
        this.contract_account_name();
        this.state = 343;
        this.match(resourcePolicyParser.POINT);
        this.state = 344;
        this.match(resourcePolicyParser.T__18);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Event_placeholderContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_event_placeholder;
    return this;
}

Event_placeholderContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Event_placeholderContext.prototype.constructor = Event_placeholderContext;

Event_placeholderContext.prototype.EVENT = function() {
    return this.getToken(resourcePolicyParser.EVENT, 0);
};

Event_placeholderContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterEvent_placeholder(this);
	}
};

Event_placeholderContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitEvent_placeholder(this);
	}
};

Event_placeholderContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitEvent_placeholder(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Event_placeholderContext = Event_placeholderContext;

resourcePolicyParser.prototype.event_placeholder = function() {

    var localctx = new Event_placeholderContext(this, this._ctx, this.state);
    this.enterRule(localctx, 84, resourcePolicyParser.RULE_event_placeholder);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 346;
        this.match(resourcePolicyParser.EVENT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function And_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_and_event;
    return this;
}

And_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
And_eventContext.prototype.constructor = And_eventContext;

And_eventContext.prototype.event = function() {
    return this.getTypedRuleContext(EventContext,0);
};

And_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAnd_event(this);
	}
};

And_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAnd_event(this);
	}
};

And_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAnd_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.And_eventContext = And_eventContext;

resourcePolicyParser.prototype.and_event = function() {

    var localctx = new And_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 86, resourcePolicyParser.RULE_and_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 348;
        this.match(resourcePolicyParser.T__19);
        this.state = 349;
        this.event();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Cycle_end_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_cycle_end_event;
    return this;
}

Cycle_end_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Cycle_end_eventContext.prototype.constructor = Cycle_end_eventContext;

Cycle_end_eventContext.prototype.TIMEUNIT = function() {
    return this.getToken(resourcePolicyParser.TIMEUNIT, 0);
};

Cycle_end_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterCycle_end_event(this);
	}
};

Cycle_end_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitCycle_end_event(this);
	}
};

Cycle_end_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitCycle_end_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Cycle_end_eventContext = Cycle_end_eventContext;

resourcePolicyParser.prototype.cycle_end_event = function() {

    var localctx = new Cycle_end_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 88, resourcePolicyParser.RULE_cycle_end_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 351;
        this.match(resourcePolicyParser.T__20);
        this.state = 352;
        this.match(resourcePolicyParser.T__21);
        this.state = 353;
        this.match(resourcePolicyParser.TIMEUNIT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Time_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_time_event;
    return this;
}

Time_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Time_eventContext.prototype.constructor = Time_eventContext;

Time_eventContext.prototype.datetime = function() {
    return this.getTypedRuleContext(DatetimeContext,0);
};

Time_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterTime_event(this);
	}
};

Time_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitTime_event(this);
	}
};

Time_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitTime_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Time_eventContext = Time_eventContext;

resourcePolicyParser.prototype.time_event = function() {

    var localctx = new Time_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 90, resourcePolicyParser.RULE_time_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 355;
        this.match(resourcePolicyParser.T__22);
        this.state = 356;
        this.datetime();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Relative_time_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_relative_time_event;
    return this;
}

Relative_time_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Relative_time_eventContext.prototype.constructor = Relative_time_eventContext;

Relative_time_eventContext.prototype.elapsed = function() {
    return this.getTypedRuleContext(ElapsedContext,0);
};

Relative_time_eventContext.prototype.TIMEUNIT = function() {
    return this.getToken(resourcePolicyParser.TIMEUNIT, 0);
};

Relative_time_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterRelative_time_event(this);
	}
};

Relative_time_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitRelative_time_event(this);
	}
};

Relative_time_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitRelative_time_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Relative_time_eventContext = Relative_time_eventContext;

resourcePolicyParser.prototype.relative_time_event = function() {

    var localctx = new Relative_time_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 92, resourcePolicyParser.RULE_relative_time_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 358;
        this.match(resourcePolicyParser.T__23);
        this.state = 359;
        this.elapsed();
        this.state = 360;
        this.match(resourcePolicyParser.TIMEUNIT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ElapsedContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_elapsed;
    return this;
}

ElapsedContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElapsedContext.prototype.constructor = ElapsedContext;

ElapsedContext.prototype.INT = function() {
    return this.getToken(resourcePolicyParser.INT, 0);
};

ElapsedContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterElapsed(this);
	}
};

ElapsedContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitElapsed(this);
	}
};

ElapsedContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitElapsed(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.ElapsedContext = ElapsedContext;

resourcePolicyParser.prototype.elapsed = function() {

    var localctx = new ElapsedContext(this, this._ctx, this.state);
    this.enterRule(localctx, 94, resourcePolicyParser.RULE_elapsed);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 362;
        this.match(resourcePolicyParser.INT);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Transaction_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_transaction_event;
    return this;
}

Transaction_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Transaction_eventContext.prototype.constructor = Transaction_eventContext;

Transaction_eventContext.prototype.amount = function() {
    return this.getTypedRuleContext(AmountContext,0);
};

Transaction_eventContext.prototype.account = function() {
    return this.getTypedRuleContext(AccountContext,0);
};

Transaction_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterTransaction_event(this);
	}
};

Transaction_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitTransaction_event(this);
	}
};

Transaction_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitTransaction_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Transaction_eventContext = Transaction_eventContext;

resourcePolicyParser.prototype.transaction_event = function() {

    var localctx = new Transaction_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 96, resourcePolicyParser.RULE_transaction_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 364;
        this.match(resourcePolicyParser.T__24);
        this.state = 365;
        this.amount();
        this.state = 366;
        this.match(resourcePolicyParser.T__12);
        this.state = 367;
        this.account();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Signing_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_signing_event;
    return this;
}

Signing_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Signing_eventContext.prototype.constructor = Signing_eventContext;

Signing_eventContext.prototype.license_resource_id = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(License_resource_idContext);
    } else {
        return this.getTypedRuleContext(License_resource_idContext,i);
    }
};

Signing_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterSigning_event(this);
	}
};

Signing_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitSigning_event(this);
	}
};

Signing_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitSigning_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Signing_eventContext = Signing_eventContext;

resourcePolicyParser.prototype.signing_event = function() {

    var localctx = new Signing_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 98, resourcePolicyParser.RULE_signing_event);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 369;
        this.match(resourcePolicyParser.T__25);
        this.state = 370;
        this.match(resourcePolicyParser.T__26);
        this.state = 371;
        this.license_resource_id();
        this.state = 376;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.COMMA) {
            this.state = 372;
            this.match(resourcePolicyParser.COMMA);
            this.state = 373;
            this.license_resource_id();
            this.state = 378;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Access_count_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_access_count_event;
    return this;
}

Access_count_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Access_count_eventContext.prototype.constructor = Access_count_eventContext;

Access_count_eventContext.prototype.recontract_count_event = function() {
    return this.getTypedRuleContext(Recontract_count_eventContext,0);
};

Access_count_eventContext.prototype.present_count_event = function() {
    return this.getTypedRuleContext(Present_count_eventContext,0);
};

Access_count_eventContext.prototype.view_count_event = function() {
    return this.getTypedRuleContext(View_count_eventContext,0);
};

Access_count_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAccess_count_event(this);
	}
};

Access_count_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAccess_count_event(this);
	}
};

Access_count_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAccess_count_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Access_count_eventContext = Access_count_eventContext;

resourcePolicyParser.prototype.access_count_event = function() {

    var localctx = new Access_count_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 100, resourcePolicyParser.RULE_access_count_event);
    try {
        this.state = 382;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,22,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 379;
            this.recontract_count_event();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 380;
            this.present_count_event();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 381;
            this.view_count_event();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Settlement_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_settlement_event;
    return this;
}

Settlement_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Settlement_eventContext.prototype.constructor = Settlement_eventContext;

Settlement_eventContext.prototype.account = function() {
    return this.getTypedRuleContext(AccountContext,0);
};

Settlement_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterSettlement_event(this);
	}
};

Settlement_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitSettlement_event(this);
	}
};

Settlement_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitSettlement_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Settlement_eventContext = Settlement_eventContext;

resourcePolicyParser.prototype.settlement_event = function() {

    var localctx = new Settlement_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 102, resourcePolicyParser.RULE_settlement_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 384;
        this.account();
        this.state = 385;
        this.match(resourcePolicyParser.T__27);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Recontract_count_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_recontract_count_event;
    return this;
}

Recontract_count_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Recontract_count_eventContext.prototype.constructor = Recontract_count_eventContext;

Recontract_count_eventContext.prototype.amount = function() {
    return this.getTypedRuleContext(AmountContext,0);
};

Recontract_count_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterRecontract_count_event(this);
	}
};

Recontract_count_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitRecontract_count_event(this);
	}
};

Recontract_count_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitRecontract_count_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Recontract_count_eventContext = Recontract_count_eventContext;

resourcePolicyParser.prototype.recontract_count_event = function() {

    var localctx = new Recontract_count_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 104, resourcePolicyParser.RULE_recontract_count_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 387;
        this.amount();
        this.state = 388;
        this.match(resourcePolicyParser.T__21);
        this.state = 389;
        this.match(resourcePolicyParser.T__28);
        this.state = 390;
        this.match(resourcePolicyParser.T__29);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Present_count_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_present_count_event;
    return this;
}

Present_count_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Present_count_eventContext.prototype.constructor = Present_count_eventContext;

Present_count_eventContext.prototype.amount = function() {
    return this.getTypedRuleContext(AmountContext,0);
};

Present_count_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterPresent_count_event(this);
	}
};

Present_count_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitPresent_count_event(this);
	}
};

Present_count_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitPresent_count_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Present_count_eventContext = Present_count_eventContext;

resourcePolicyParser.prototype.present_count_event = function() {

    var localctx = new Present_count_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 106, resourcePolicyParser.RULE_present_count_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 392;
        this.amount();
        this.state = 393;
        this.match(resourcePolicyParser.T__21);
        this.state = 394;
        this.match(resourcePolicyParser.T__30);
        this.state = 395;
        this.match(resourcePolicyParser.T__29);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function View_count_eventContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_view_count_event;
    return this;
}

View_count_eventContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
View_count_eventContext.prototype.constructor = View_count_eventContext;

View_count_eventContext.prototype.amount = function() {
    return this.getTypedRuleContext(AmountContext,0);
};

View_count_eventContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterView_count_event(this);
	}
};

View_count_eventContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitView_count_event(this);
	}
};

View_count_eventContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitView_count_event(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.View_count_eventContext = View_count_eventContext;

resourcePolicyParser.prototype.view_count_event = function() {

    var localctx = new View_count_eventContext(this, this._ctx, this.state);
    this.enterRule(localctx, 108, resourcePolicyParser.RULE_view_count_event);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 397;
        this.amount();
        this.state = 398;
        this.match(resourcePolicyParser.T__21);
        this.state = 399;
        this.match(resourcePolicyParser.T__31);
        this.state = 400;
        this.match(resourcePolicyParser.T__29);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AmountContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_amount;
    return this;
}

AmountContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AmountContext.prototype.constructor = AmountContext;

AmountContext.prototype.expression_call_or_literal = function() {
    return this.getTypedRuleContext(Expression_call_or_literalContext,0);
};

AmountContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAmount(this);
	}
};

AmountContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAmount(this);
	}
};

AmountContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAmount(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.AmountContext = AmountContext;

resourcePolicyParser.prototype.amount = function() {

    var localctx = new AmountContext(this, this._ctx, this.state);
    this.enterRule(localctx, 110, resourcePolicyParser.RULE_amount);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 402;
        this.expression_call_or_literal();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Expression_call_or_literalContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression_call_or_literal;
    return this;
}

Expression_call_or_literalContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Expression_call_or_literalContext.prototype.constructor = Expression_call_or_literalContext;

Expression_call_or_literalContext.prototype.expression_call = function() {
    return this.getTypedRuleContext(Expression_callContext,0);
};

Expression_call_or_literalContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

Expression_call_or_literalContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression_call_or_literal(this);
	}
};

Expression_call_or_literalContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression_call_or_literal(this);
	}
};

Expression_call_or_literalContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression_call_or_literal(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Expression_call_or_literalContext = Expression_call_or_literalContext;

resourcePolicyParser.prototype.expression_call_or_literal = function() {

    var localctx = new Expression_call_or_literalContext(this, this._ctx, this.state);
    this.enterRule(localctx, 112, resourcePolicyParser.RULE_expression_call_or_literal);
    try {
        this.state = 406;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,23,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 404;
            this.expression_call();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 405;
            this.expression();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_expression;
    return this;
}

ExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExpressionContext.prototype.constructor = ExpressionContext;

ExpressionContext.prototype.multiplyingExpression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(MultiplyingExpressionContext);
    } else {
        return this.getTypedRuleContext(MultiplyingExpressionContext,i);
    }
};

ExpressionContext.prototype.PLUS = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.PLUS);
    } else {
        return this.getToken(resourcePolicyParser.PLUS, i);
    }
};


ExpressionContext.prototype.MINUS = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.MINUS);
    } else {
        return this.getToken(resourcePolicyParser.MINUS, i);
    }
};


ExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterExpression(this);
	}
};

ExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitExpression(this);
	}
};

ExpressionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitExpression(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.ExpressionContext = ExpressionContext;

resourcePolicyParser.prototype.expression = function() {

    var localctx = new ExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 114, resourcePolicyParser.RULE_expression);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 408;
        this.multiplyingExpression();
        this.state = 413;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.PLUS || _la===resourcePolicyParser.MINUS) {
            this.state = 409;
            _la = this._input.LA(1);
            if(!(_la===resourcePolicyParser.PLUS || _la===resourcePolicyParser.MINUS)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 410;
            this.multiplyingExpression();
            this.state = 415;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function MultiplyingExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_multiplyingExpression;
    return this;
}

MultiplyingExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MultiplyingExpressionContext.prototype.constructor = MultiplyingExpressionContext;

MultiplyingExpressionContext.prototype.powExpression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(PowExpressionContext);
    } else {
        return this.getTypedRuleContext(PowExpressionContext,i);
    }
};

MultiplyingExpressionContext.prototype.TIMES = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.TIMES);
    } else {
        return this.getToken(resourcePolicyParser.TIMES, i);
    }
};


MultiplyingExpressionContext.prototype.DIV = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.DIV);
    } else {
        return this.getToken(resourcePolicyParser.DIV, i);
    }
};


MultiplyingExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterMultiplyingExpression(this);
	}
};

MultiplyingExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitMultiplyingExpression(this);
	}
};

MultiplyingExpressionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitMultiplyingExpression(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.MultiplyingExpressionContext = MultiplyingExpressionContext;

resourcePolicyParser.prototype.multiplyingExpression = function() {

    var localctx = new MultiplyingExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 116, resourcePolicyParser.RULE_multiplyingExpression);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 416;
        this.powExpression();
        this.state = 421;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.TIMES || _la===resourcePolicyParser.DIV) {
            this.state = 417;
            _la = this._input.LA(1);
            if(!(_la===resourcePolicyParser.TIMES || _la===resourcePolicyParser.DIV)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 418;
            this.powExpression();
            this.state = 423;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function PowExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_powExpression;
    return this;
}

PowExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PowExpressionContext.prototype.constructor = PowExpressionContext;

PowExpressionContext.prototype.signedAtom = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SignedAtomContext);
    } else {
        return this.getTypedRuleContext(SignedAtomContext,i);
    }
};

PowExpressionContext.prototype.POW = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.POW);
    } else {
        return this.getToken(resourcePolicyParser.POW, i);
    }
};


PowExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterPowExpression(this);
	}
};

PowExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitPowExpression(this);
	}
};

PowExpressionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitPowExpression(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.PowExpressionContext = PowExpressionContext;

resourcePolicyParser.prototype.powExpression = function() {

    var localctx = new PowExpressionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 118, resourcePolicyParser.RULE_powExpression);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 424;
        this.signedAtom();
        this.state = 429;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.POW) {
            this.state = 425;
            this.match(resourcePolicyParser.POW);
            this.state = 426;
            this.signedAtom();
            this.state = 431;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function SignedAtomContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_signedAtom;
    return this;
}

SignedAtomContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SignedAtomContext.prototype.constructor = SignedAtomContext;

SignedAtomContext.prototype.PLUS = function() {
    return this.getToken(resourcePolicyParser.PLUS, 0);
};

SignedAtomContext.prototype.signedAtom = function() {
    return this.getTypedRuleContext(SignedAtomContext,0);
};

SignedAtomContext.prototype.MINUS = function() {
    return this.getToken(resourcePolicyParser.MINUS, 0);
};

SignedAtomContext.prototype.built_in_function = function() {
    return this.getTypedRuleContext(Built_in_functionContext,0);
};

SignedAtomContext.prototype.atom = function() {
    return this.getTypedRuleContext(AtomContext,0);
};

SignedAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterSignedAtom(this);
	}
};

SignedAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitSignedAtom(this);
	}
};

SignedAtomContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitSignedAtom(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.SignedAtomContext = SignedAtomContext;

resourcePolicyParser.prototype.signedAtom = function() {

    var localctx = new SignedAtomContext(this, this._ctx, this.state);
    this.enterRule(localctx, 120, resourcePolicyParser.RULE_signedAtom);
    try {
        this.state = 438;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.PLUS:
            this.enterOuterAlt(localctx, 1);
            this.state = 432;
            this.match(resourcePolicyParser.PLUS);
            this.state = 433;
            this.signedAtom();
            break;
        case resourcePolicyParser.MINUS:
            this.enterOuterAlt(localctx, 2);
            this.state = 434;
            this.match(resourcePolicyParser.MINUS);
            this.state = 435;
            this.signedAtom();
            break;
        case resourcePolicyParser.SUM:
            this.enterOuterAlt(localctx, 3);
            this.state = 436;
            this.built_in_function();
            break;
        case resourcePolicyParser.INT:
        case resourcePolicyParser.ID:
        case resourcePolicyParser.LPAREN:
        case resourcePolicyParser.PI:
        case resourcePolicyParser.SCIENTIFIC_NUMBER:
        case resourcePolicyParser.EULER:
            this.enterOuterAlt(localctx, 4);
            this.state = 437;
            this.atom();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Built_in_functionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_built_in_function;
    return this;
}

Built_in_functionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Built_in_functionContext.prototype.constructor = Built_in_functionContext;

Built_in_functionContext.prototype.funcname = function() {
    return this.getTypedRuleContext(FuncnameContext,0);
};

Built_in_functionContext.prototype.LPAREN = function() {
    return this.getToken(resourcePolicyParser.LPAREN, 0);
};

Built_in_functionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

Built_in_functionContext.prototype.RPAREN = function() {
    return this.getToken(resourcePolicyParser.RPAREN, 0);
};

Built_in_functionContext.prototype.COMMA = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(resourcePolicyParser.COMMA);
    } else {
        return this.getToken(resourcePolicyParser.COMMA, i);
    }
};


Built_in_functionContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterBuilt_in_function(this);
	}
};

Built_in_functionContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitBuilt_in_function(this);
	}
};

Built_in_functionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitBuilt_in_function(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.Built_in_functionContext = Built_in_functionContext;

resourcePolicyParser.prototype.built_in_function = function() {

    var localctx = new Built_in_functionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 122, resourcePolicyParser.RULE_built_in_function);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 440;
        this.funcname();
        this.state = 441;
        this.match(resourcePolicyParser.LPAREN);
        this.state = 442;
        this.expression();
        this.state = 447;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===resourcePolicyParser.COMMA) {
            this.state = 443;
            this.match(resourcePolicyParser.COMMA);
            this.state = 444;
            this.expression();
            this.state = 449;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 450;
        this.match(resourcePolicyParser.RPAREN);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FuncnameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_funcname;
    return this;
}

FuncnameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FuncnameContext.prototype.constructor = FuncnameContext;

FuncnameContext.prototype.SUM = function() {
    return this.getToken(resourcePolicyParser.SUM, 0);
};

FuncnameContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterFuncname(this);
	}
};

FuncnameContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitFuncname(this);
	}
};

FuncnameContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitFuncname(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.FuncnameContext = FuncnameContext;

resourcePolicyParser.prototype.funcname = function() {

    var localctx = new FuncnameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 124, resourcePolicyParser.RULE_funcname);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 452;
        this.match(resourcePolicyParser.SUM);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function AtomContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_atom;
    return this;
}

AtomContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AtomContext.prototype.constructor = AtomContext;

AtomContext.prototype.scientific = function() {
    return this.getTypedRuleContext(ScientificContext,0);
};

AtomContext.prototype.constant = function() {
    return this.getTypedRuleContext(ConstantContext,0);
};

AtomContext.prototype.LPAREN = function() {
    return this.getToken(resourcePolicyParser.LPAREN, 0);
};

AtomContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

AtomContext.prototype.RPAREN = function() {
    return this.getToken(resourcePolicyParser.RPAREN, 0);
};

AtomContext.prototype.INT = function() {
    return this.getToken(resourcePolicyParser.INT, 0);
};

AtomContext.prototype.variable = function() {
    return this.getTypedRuleContext(VariableContext,0);
};

AtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterAtom(this);
	}
};

AtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitAtom(this);
	}
};

AtomContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitAtom(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.AtomContext = AtomContext;

resourcePolicyParser.prototype.atom = function() {

    var localctx = new AtomContext(this, this._ctx, this.state);
    this.enterRule(localctx, 126, resourcePolicyParser.RULE_atom);
    try {
        this.state = 462;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case resourcePolicyParser.SCIENTIFIC_NUMBER:
            this.enterOuterAlt(localctx, 1);
            this.state = 454;
            this.scientific();
            break;
        case resourcePolicyParser.PI:
        case resourcePolicyParser.EULER:
            this.enterOuterAlt(localctx, 2);
            this.state = 455;
            this.constant();
            break;
        case resourcePolicyParser.LPAREN:
            this.enterOuterAlt(localctx, 3);
            this.state = 456;
            this.match(resourcePolicyParser.LPAREN);
            this.state = 457;
            this.expression();
            this.state = 458;
            this.match(resourcePolicyParser.RPAREN);
            break;
        case resourcePolicyParser.INT:
            this.enterOuterAlt(localctx, 4);
            this.state = 460;
            this.match(resourcePolicyParser.INT);
            break;
        case resourcePolicyParser.ID:
            this.enterOuterAlt(localctx, 5);
            this.state = 461;
            this.variable();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ScientificContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_scientific;
    return this;
}

ScientificContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ScientificContext.prototype.constructor = ScientificContext;

ScientificContext.prototype.SCIENTIFIC_NUMBER = function() {
    return this.getToken(resourcePolicyParser.SCIENTIFIC_NUMBER, 0);
};

ScientificContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterScientific(this);
	}
};

ScientificContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitScientific(this);
	}
};

ScientificContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitScientific(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.ScientificContext = ScientificContext;

resourcePolicyParser.prototype.scientific = function() {

    var localctx = new ScientificContext(this, this._ctx, this.state);
    this.enterRule(localctx, 128, resourcePolicyParser.RULE_scientific);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 464;
        this.match(resourcePolicyParser.SCIENTIFIC_NUMBER);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ConstantContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_constant;
    return this;
}

ConstantContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstantContext.prototype.constructor = ConstantContext;

ConstantContext.prototype.PI = function() {
    return this.getToken(resourcePolicyParser.PI, 0);
};

ConstantContext.prototype.EULER = function() {
    return this.getToken(resourcePolicyParser.EULER, 0);
};

ConstantContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterConstant(this);
	}
};

ConstantContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitConstant(this);
	}
};

ConstantContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitConstant(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.ConstantContext = ConstantContext;

resourcePolicyParser.prototype.constant = function() {

    var localctx = new ConstantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 130, resourcePolicyParser.RULE_constant);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 466;
        _la = this._input.LA(1);
        if(!(_la===resourcePolicyParser.PI || _la===resourcePolicyParser.EULER)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function VariableContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = resourcePolicyParser.RULE_variable;
    return this;
}

VariableContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
VariableContext.prototype.constructor = VariableContext;

VariableContext.prototype.ID = function() {
    return this.getToken(resourcePolicyParser.ID, 0);
};

VariableContext.prototype.enterRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.enterVariable(this);
	}
};

VariableContext.prototype.exitRule = function(listener) {
    if(listener instanceof resourcePolicyListener ) {
        listener.exitVariable(this);
	}
};

VariableContext.prototype.accept = function(visitor) {
    if ( visitor instanceof resourcePolicyVisitor ) {
        return visitor.visitVariable(this);
    } else {
        return visitor.visitChildren(this);
    }
};




resourcePolicyParser.VariableContext = VariableContext;

resourcePolicyParser.prototype.variable = function() {

    var localctx = new VariableContext(this, this._ctx, this.state);
    this.enterRule(localctx, 132, resourcePolicyParser.RULE_variable);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 468;
        this.match(resourcePolicyParser.ID);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


resourcePolicyParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 18:
			return this.audience_clause_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

resourcePolicyParser.prototype.audience_clause_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 1);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.resourcePolicyParser = resourcePolicyParser;
