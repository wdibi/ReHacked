// Parser module
//
//   const parse = require('./parser');
//   const ast = parse(sourceCodeString);

const ohm = require("ohm-js");
const fs = require("fs");

const {
  Program,
  Block,
  AssignmentStatement,
  RepeatStatement,
  ForStatement,
  IfStatement,
  WhileStatement,
  VariableDeclaration,
  FunctionCall,
  BooleanLiteral,
  NumericLiteral,
  CharacterLiteral,
  IdExpression,
  BoolType,
  CharType,
  StringType,
  NumType,
  ListType,
  DictType,
  BinaryExpression,
  UnaryExpression,
  AutoType,
  CallChain,
  ListExpression,
  PrintStatement,
  StringLiteral,
  DictionaryExpression,
  KeyValuePair,
  FunctionDeclaration,
  Parameter,
  ReturnStatement,
} = require(".");

const grammar = ohm.grammar(fs.readFileSync("./grammar/pivot.ohm"));

function arrayToNullable(a) {
  return a.length === 0 ? null : a[0];
}

/* eslint-disable no-unused-vars */
const astBuilder = grammar.createSemantics().addOperation("ast", {
  Program(b) {
    return new Program(b.ast());
  },
  Block(s) {
    return new Block(s.ast());
  },
  VarDeclaration_single(type, id, _arrow, init, _sc) {
    return new VariableDeclaration(id.ast(), type.ast(), init.ast());
  },
  VarDeclaration_multi(_all, type, ids, _arrow, initials, _sc) {
    return new VariableDeclaration(ids.ast(), type.ast(), initials.ast());
  },
  IterationStatement_while(_while, test, _do, block, _end) {
    return new WhileStatement(test.ast(), block.ast());
  },
  IterationStatement_repeat(_repeat, block, _until, exp, _sc) {
    return new RepeatStatement(block.ast(), exp.ast());
  },
  IterationStatement_for(_for, initial, test, _sc, exp, _do, body, _end) {
    return new ForStatement(initial.ast(), test.ast(), exp.ast(), body.ast());
  },
  CallStatement_function(id, _openParen, args, _closeParen, _sc) {
    return new FunctionCall(id.ast(), args.ast());
  },
  FunctionDeclaration_regular(i, _o, a, _c, _arrow, t, b, _e) {
    return new FunctionDeclaration(i.ast(), t.ast(), a.ast(), b.ast());
  },
  FunctionCall(id, _openParen, args, _closeParen) {
    return new FunctionCall(id.ast(), args.ast());
  },
  CallStatement_chain(item, _dArrow, methods) {
    return new CallChain(item.ast(), methods.ast());
  },
  IfStatement(_if, test, _then, consequent, _else, alternate, _end) {
    return new IfStatement(
      test.ast(),
      consequent.ast(),
      arrayToNullable(alternate.ast())
    );
  },
  Assignment(id, _a, e, _) {
    return new AssignmentStatement(id.ast(), e.ast());
  },
  BooleanType(_) {
    return BoolType;
  },
  CharType(_) {
    return CharType;
  },
  StringType(_) {
    return StringType;
  },
  NumType(_) {
    return NumType;
  },
  AutoType(_) {
    return AutoType;
  },
  ListType(_open, type, _close) {
    return new ListType(type.ast());
  },
  DictType(_open, keyType, _colon, valueType, _close) {
    return new DictType(keyType.ast(), valueType.ast());
  },
  Exp_binary(e1, _, e2) {
    let op = this.sourceString.includes("or") ? "or" : "||";
    return new BinaryExpression(op, e1.ast(), e2.ast());
  },
  Exp1_binary(e1, _, e2) {
    let op = this.sourceString.includes("and") ? "and" : "&&";
    return new BinaryExpression(op, e1.ast(), e2.ast());
  },
  Exp2_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp3_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp4_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp5_unary(op, e) {
    return new UnaryExpression(op.sourceString, e.ast());
  },
  Exp6_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp7_list(l) {
    return l.ast();
  },
  Exp7_dict(d) {
    return d.ast();
  },
  Exp7_parens(_1, e, _2) {
    return e.ast();
  },
  Parameter(t, i) {
    return new Parameter(t.ast(), i.ast());
  },
  PrintStatement(_print, item, _sc) {
    return new PrintStatement(item.ast());
  },
  ReturnStatement(_r, item, _sc) {
    return new ReturnStatement(item.ast());
  },
  List(_open, elements, _close) {
    return new ListExpression(elements.ast());
  },
  Dict(_open, pair, _close) {
    return new DictionaryExpression(pair.ast());
  },
  boollit(_) {
    return new BooleanLiteral(this.sourceString === "true");
  },
  numlit(_first, _, _last) {
    return new NumericLiteral(+this.sourceString);
  },
  charlit(_openQuote, char, _closeQuote) {
    return new CharacterLiteral(this.sourceString.slice(1, -1));
  },
  strlit(_openQuote, str, _closeQuote) {
    return new StringLiteral(this.sourceString.slice(1, -1));
  },
  id(_first, _rest) {
    return new IdExpression(this.sourceString);
  },
  nonemptyListOf(first, _, rest) {
    return [first.ast(), ...rest.ast()];
  },
  NonemptyListOf(first, _, rest) {
    return [first.ast(), ...rest.ast()];
  },
  KeyValuePair(key, _colon, value) {
    return new KeyValuePair(key.ast(), value.ast());
  },
  // _terminal() {
  //   return this.sourceString;
  // },
});

/* eslint-enable no-unused-vars */

module.exports = text => {
  const match = grammar.match(text);
  if (!match.succeeded()) {
    throw match.message;
  }
  return astBuilder(match).ast();
};
