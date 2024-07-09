from enum import Enum
from io import TextIOBase
from typing import List, Optional, Tuple, Union

from xdsl.dialects.builtin import ModuleOp
from xdsl.ir import Operation

import choco.dialects.choco_ast as ast
from choco.lexer import Lexer, Token, TokenKind


class ErrorKind(Enum):
    CommaExpected = 0
    ComparisonNotAssociative = 1
    ExpectedExpression = 2
    Indentation = 3
    NoLhsInAssignment = 4
    TokenNotFound = 5
    UnexpectedIndentation = 6
    UnknownType = 7
    UnmatchedParantheses = 8
    VariableDefinedLater = 9


class Parser:
    """
    A Simple ChocoPy Parser

    Parse the given tokens from the lexer and call the xDSL API to create an AST.
    """

    def __init__(self, lexer: Lexer):
        """
        Create a new parser.

        Initialize parser with the corresponding lexer.
        """
        self.lexer = lexer

    def check(self, expected: Union[List[TokenKind], TokenKind]) -> bool:
        """
                Check that the next token is of a given kind. If a list of n TokenKinds
                is given, check that the next n TokenKinds match the next expected
                ones.

                :param expected: The kind of the token we expect or a list of expected
                                    token kinds if we look ahead more than one token at
                                    a time.
                :returns: True if the next token has the expected token kind, False
        ￼                 otherwise.
        """

        if isinstance(expected, list):
            tokens = self.lexer.peek(len(expected))
            assert isinstance(tokens, list), "List of tokens expected"
            return all([tok.kind == type_ for tok, type_ in zip(tokens, expected)])

        token = self.lexer.peek()
        assert isinstance(token, Token), "Single token expected"
        return token.kind == expected

    def match(self, expected: TokenKind) -> Token:
        """
        Match a token by first checking the token kind. In case the token is of
        the expected kind, we consume the token.  If a token with an unexpected
        token kind is encountered, an error is reported by raising an
        exception.

        The exception shows information about the line where the token was expected.

        :param expected: The kind of the token we expect.
        :returns: The consumed token if the next token has the expected token
                  kind, otherwise a parsing error is reported.
        """

        if self.check(expected):
            token = self.lexer.peek()
            assert isinstance(token, Token), "A single token expected"
            self.lexer.consume()
            return token

        token = self.lexer.peek()
        assert isinstance(token, Token), "A single token expected"
        print(f"Error: token of kind {expected} not found.")
        exit(0)

    def parse_program(self) -> ModuleOp:
        """
        Parse a ChocoPy program.

        program ::= def_seq stmt_seq EOF

        :returns: The AST of a ChocoPy Program.
        """

        if self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.UnexpectedIndentation)

        defs = self.parse_def_seq()

        if self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.UnexpectedIndentation)

        stmts = self.parse_stmt_seq()

        if self.check(TokenKind.ASSIGN):
            self.syntax_error(ErrorKind.NoLhsInAssignment)

        if self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.UnexpectedIndentation)

        self.match(TokenKind.EOF)

        return ModuleOp([ast.Program(defs, stmts)])

    def parse_def_seq(self) -> List[Operation]:
        """
        Parse a sequence of function and variable definitions.

        def_seq ::= [func_def | var_def]*

        :returns: A list of function and variable definitions.
        """

        defs: List[Operation] = []
        checked: bool = False

        while self.check([TokenKind.IDENTIFIER, TokenKind.COLON]):
            var_def = self.parse_var_def()
            defs.append(var_def)
            checked = True

        while self.check(TokenKind.DEF):
            func_def = self.parse_function()
            defs.append(func_def)
            checked = True

        if checked:
            defs += self.parse_def_seq()

        return defs

    def parse_var_def(self) -> Operation:
        """
        Parse a variable definition.

        var_def := `ID` type `=` literal NEWLINE
        """

        var_name = self.match(TokenKind.IDENTIFIER)
        self.match(TokenKind.COLON)
        type_ = self.parse_type()
        if not self.check(TokenKind.ASSIGN):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.ASSIGN)
        self.match(TokenKind.ASSIGN)
        literal = self.parse_literal()
        if not self.check(TokenKind.NEWLINE):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.NEWLINE)
        self.match(TokenKind.NEWLINE)
        typed_var = ast.TypedVar(var_name.value, type_)
        return ast.VarDef(typed_var, literal)

    def parse_type(self) -> Operation:
        """
        Parse a type.

        type := `int`
             | `bool`
             | `str`
             | `object`
             | `[` type `]`
        """

        if self.check(TokenKind.OBJECT):
            self.match(TokenKind.OBJECT)
            return ast.TypeName("object")
        elif self.check(TokenKind.INT):
            self.match(TokenKind.INT)
            return ast.TypeName("int")
        elif self.check(TokenKind.BOOL):
            self.match(TokenKind.BOOL)
            return ast.TypeName("bool")
        elif self.check(TokenKind.STR):
            self.match(TokenKind.STR)
            return ast.TypeName("str")
        elif self.check(TokenKind.LSQUAREBRACKET):
            self.match(TokenKind.LSQUAREBRACKET)
            elem_type = self.parse_type()
            self.match(TokenKind.RSQUAREBRACKET)
            return ast.ListType(elem_type)
        else:
            self.syntax_error(ErrorKind.UnknownType)

    def parse_literal(self) -> Operation:
        """
        Parse a literal.

        literal := `None`
                | `True`
                | `False`
                | INTEGER
                | STRING
        """

        if self.check(TokenKind.NONE):
            self.match(TokenKind.NONE)
            return ast.Literal(None)
        elif self.check(TokenKind.TRUE):
            self.match(TokenKind.TRUE)
            return ast.Literal(True)
        elif self.check(TokenKind.FALSE):
            self.match(TokenKind.FALSE)
            return ast.Literal(False)
        elif self.check(TokenKind.INTEGER):
            int_token = self.match(TokenKind.INTEGER)
            return ast.Literal(int(int_token.value))
        elif self.check(TokenKind.STRING):
            str_token = self.match(TokenKind.STRING)
            return ast.Literal(str_token.value)
        else:
            raise Exception("Error: Invalid literal.")

    def parse_function(self) -> Operation:
        """
        Parse a function definition.

        func_def := `def` ID `(` func_params `)` func_return_type `:` NEWLINE INDENT func_body DEDENT
        """

        self.match(TokenKind.DEF)
        function_name = self.match(TokenKind.IDENTIFIER)
        if not self.check(TokenKind.LROUNDBRACKET):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.LROUNDBRACKET)
        self.match(TokenKind.LROUNDBRACKET)

        # Function parameters
        parameters = self.parse_func_params()
        if not self.check(TokenKind.RROUNDBRACKET):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.RROUNDBRACKET)
        self.match(TokenKind.RROUNDBRACKET)

        # Return type: default is <None>.
        return_type = self.parse_func_return_type()
        if not self.check(TokenKind.COLON):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
        self.match(TokenKind.COLON)
        if not self.check(TokenKind.NEWLINE):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.NEWLINE)
        self.match(TokenKind.NEWLINE)
        if not self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.Indentation, location="function")
        self.match(TokenKind.INDENT)

        defs_and_decls = self.parse_func_decl_list()
        stmt_seq = self.parse_stmt_seq()
        if self.check(TokenKind.ASSIGN):
            self.syntax_error(ErrorKind.NoLhsInAssignment)
        if self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.UnexpectedIndentation)
        if not stmt_seq:
            self.syntax_error(ErrorKind.Indentation, location="function")

        func_body = defs_and_decls + stmt_seq
        self.match(TokenKind.DEDENT)
        return ast.FuncDef(function_name.value, parameters, return_type, func_body)

    def parse_func_params(self) -> List[Operation]:
        """
        Parse function parameters.

        func_params := [ID `:` type (`,` ID `:` type)*]
        """

        params: List[Operation] = []

        if self.check(TokenKind.IDENTIFIER):
            var_name = self.match(TokenKind.IDENTIFIER)
            self.match(TokenKind.COLON)
            type_ = self.parse_type()
            params.append(ast.TypedVar(var_name.value, type_))

            while not (
                self.check(TokenKind.RROUNDBRACKET) or self.check(TokenKind.NEWLINE)
            ):
                if not self.check(TokenKind.COMMA):
                    self.syntax_error(ErrorKind.CommaExpected)
                self.match(TokenKind.COMMA)
                var_name = self.match(TokenKind.IDENTIFIER)
                self.match(TokenKind.COLON)
                type_ = self.parse_type()
                params.append(ast.TypedVar(var_name.value, type_))

        return params

    def parse_func_return_type(self) -> Operation:
        """
        Parse the return type of a function.

        func_return_type := `->` type
                         | epsilon
        """

        if self.check(TokenKind.RARROW):
            self.match(TokenKind.RARROW)
            return self.parse_type()
        else:
            return ast.TypeName("<None>")

    def parse_func_decl_list(self) -> List[Operation]:
        """
        Parse a sequence of function declarations.

        func_decl_list := [global_decl | nonlocal_decl | var_def]*
        """

        defs_and_decls: List[Operation] = []

        if self.check(TokenKind.GLOBAL):
            self.match(TokenKind.GLOBAL)
            if not self.check(TokenKind.IDENTIFIER):
                self.syntax_error(
                    ErrorKind.TokenNotFound, expected=TokenKind.IDENTIFIER
                )
            decl_name = self.match(TokenKind.IDENTIFIER)
            self.match(TokenKind.NEWLINE)
            defs_and_decls.append(ast.GlobalDecl(decl_name.value))
            defs_and_decls += self.parse_func_decl_list()
        elif self.check(TokenKind.NONLOCAL):
            self.match(TokenKind.NONLOCAL)
            if not self.check(TokenKind.IDENTIFIER):
                self.syntax_error(
                    ErrorKind.TokenNotFound, expected=TokenKind.IDENTIFIER
                )
            decl_name = self.match(TokenKind.IDENTIFIER)
            self.match(TokenKind.NEWLINE)
            defs_and_decls.append(ast.NonLocalDecl(decl_name.value))
            defs_and_decls += self.parse_func_decl_list()
        elif self.check([TokenKind.IDENTIFIER, TokenKind.COLON]):
            var_def = self.parse_var_def()
            defs_and_decls.append(var_def)
            defs_and_decls += self.parse_func_decl_list()

        return defs_and_decls

    def is_expr_first_set(self) -> bool:
        """
        Check if the next token is in the first set of an expression.
        """

        return (
            self.check(TokenKind.NOT)
            or self.check(TokenKind.IDENTIFIER)
            or self.check(TokenKind.NONE)
            or self.check(TokenKind.TRUE)
            or self.check(TokenKind.FALSE)
            or self.check(TokenKind.INTEGER)
            or self.check(TokenKind.STRING)
            or self.check(TokenKind.LSQUAREBRACKET)
            or self.check(TokenKind.LROUNDBRACKET)
            or self.check(TokenKind.MINUS)
        )

    def is_stmt_first_set(self) -> bool:
        """
        Check if the next token is in the first set of a statement.
        """

        return (
            self.is_expr_first_set()
            or self.check(TokenKind.PASS)
            or self.check(TokenKind.RETURN)
            or self.check(TokenKind.IF)
            or self.check(TokenKind.WHILE)
            or self.check(TokenKind.FOR)
        )

    def parse_stmt_seq(self) -> List[Operation]:
        """Parse a sequence of statements.

        stmt_seq := stmt stmt_seq

        :return: list of Operations
        """

        stmt_seq: List[Operation] = []
        while self.is_stmt_first_set():
            stmt_op = self.parse_stmt()
            stmt_seq.append(stmt_op)
        return stmt_seq

    def parse_stmt(self) -> Operation:
        """Parse a statement.

        stmt := simple_stmt NEWLINE
             | `if` expr `:` block else_block
             | `while` expr `:` block
             | `for` ID `in` expr `:` block

        :return: Statement as operation
        """

        if (
            self.is_expr_first_set()
            or self.check(TokenKind.PASS)
            or self.check(TokenKind.RETURN)
        ):
            simple_stmt = self.parse_simple_stmt()
            if not self.check(TokenKind.NEWLINE):
                if self.check(TokenKind.RROUNDBRACKET):
                    self.syntax_error(ErrorKind.UnmatchedParantheses)
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.NEWLINE)
            self.match(TokenKind.NEWLINE)
            return simple_stmt
        elif self.check(TokenKind.IF):
            self.match(TokenKind.IF)
            cond = self.parse_expr()
            if not cond:
                self.syntax_error(ErrorKind.ExpectedExpression)
            if not self.check(TokenKind.COLON):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
            self.match(TokenKind.COLON)
            then = self.parse_block()
            orelse = self.parse_optional_else_block()
            return ast.If(cond, then, orelse)
        elif self.check(TokenKind.WHILE):
            self.match(TokenKind.WHILE)
            cond = self.parse_expr()
            if not cond:
                self.syntax_error(ErrorKind.ExpectedExpression)
            if not self.check(TokenKind.COLON):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
            self.match(TokenKind.COLON)
            body = self.parse_block()
            return ast.While(cond, body)
        elif self.check(TokenKind.FOR):
            self.match(TokenKind.FOR)
            iter_name = self.match(TokenKind.IDENTIFIER)
            if not self.check(TokenKind.IN):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.IN)
            self.match(TokenKind.IN)
            iter_ = self.parse_expr()
            if not iter_:
                self.syntax_error(ErrorKind.ExpectedExpression)
            if not self.check(TokenKind.COLON):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
            self.match(TokenKind.COLON)
            body = self.parse_block()
            return ast.For(iter_name.value, iter_, body)
        else:
            raise Exception("Error: Invalid statement.")

    def parse_block(self) -> List[Operation]:
        """
        Parse a block of statements.

        block := NEWLINE INDENT stmt_seq DEDENT
        """

        if not self.check(TokenKind.NEWLINE):
            self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.NEWLINE)
        self.match(TokenKind.NEWLINE)
        if not self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.Indentation, location="block")
        self.match(TokenKind.INDENT)
        block_stmt_seq = self.parse_stmt_seq()
        if not block_stmt_seq:
            self.syntax_error(ErrorKind.Indentation, location="block")
        if self.check(TokenKind.INDENT):
            self.syntax_error(ErrorKind.UnexpectedIndentation)
        self.match(TokenKind.DEDENT)

        return block_stmt_seq

    def parse_optional_else_block(self) -> List[Operation]:
        """
        Parse an optional else block.

        else_block := `elif` expr `:` block else_block
                   | `else` `:` block
                   | epsilon
        """

        if self.check(TokenKind.ELIF):
            self.match(TokenKind.ELIF)
            cond = self.parse_expr()
            if not cond:
                self.syntax_error(ErrorKind.ExpectedExpression)
            if not self.check(TokenKind.COLON):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
            self.match(TokenKind.COLON)
            then = self.parse_block()
            orelse = self.parse_optional_else_block()
            return [ast.If(cond, then, orelse)]
        elif self.check(TokenKind.ELSE):
            self.match(TokenKind.ELSE)
            if not self.check(TokenKind.COLON):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.COLON)
            self.match(TokenKind.COLON)
            return self.parse_block()
        else:
            return []

    def parse_simple_stmt(self) -> Operation:
        """Parse a simple statement.

        simple_stmt := `pass`
                    | `return` optional_expr
                    | expr
                    | [expr `=`]+ expr

        :return: Statement as operation
        """

        if self.check(TokenKind.PASS):
            self.match(TokenKind.PASS)
            return ast.Pass()
        elif self.check(TokenKind.RETURN):
            self.match(TokenKind.RETURN)
            optional_expr = self.parse_optional_expr()
            return ast.Return(optional_expr)
        # making sure that a simple statement is not a variable declaration
        elif self.check([TokenKind.IDENTIFIER, TokenKind.COLON]):
            self.match(TokenKind.IDENTIFIER)
            self.syntax_error(ErrorKind.VariableDefinedLater)
        elif self.is_expr_first_set():
            return self.parse_expr_assign_list()
        else:
            raise Exception("Error: Invalid simple statement.")

    def parse_expr(
        self, and_call: bool = False, or_call: bool = False
    ) -> Optional[Operation]:
        """
        Parse an expression.

        expr := `not` expr
              | cexpr
              | expr `and` expr
              | expr `or` expr
              | expr `if` expr `else` expr
        """

        expr = None

        if self.check(TokenKind.NOT):
            expr = self.parse_not_expr()
        elif self.is_expr_first_set():
            expr = self.parse_cexpr()

        if self.check(TokenKind.AND) and not and_call:
            expr = self.parse_and_expr(expr)
        if self.check(TokenKind.OR) and not (and_call or or_call):
            expr = self.parse_or_expr(expr)
        if self.check(TokenKind.IF) and not (and_call or or_call):
            self.match(TokenKind.IF)
            ternary_expr_cond = self.parse_expr()
            if not ternary_expr_cond:
                self.syntax_error(ErrorKind.ExpectedExpression)
            if not self.check(TokenKind.ELSE):
                self.syntax_error(ErrorKind.TokenNotFound, expected=TokenKind.ELSE)
            self.match(TokenKind.ELSE)
            ternary_expr_orelse = self.parse_expr()
            if not ternary_expr_orelse:
                self.syntax_error(ErrorKind.ExpectedExpression)
            return ast.IfExpr(ternary_expr_cond, expr, ternary_expr_orelse)

        return expr

    def parse_not_expr(self) -> Operation:
        """
        Parse a not expression.

        not_expr := `not` expr
        """

        self.match(TokenKind.NOT)
        if self.check(TokenKind.NOT):
            return ast.UnaryExpr("not", self.parse_not_expr())
        cexpr = self.parse_cexpr()
        if not cexpr:
            self.syntax_error(ErrorKind.ExpectedExpression)
        return ast.UnaryExpr("not", cexpr)

    def parse_and_expr(self, expr: Operation) -> Operation:
        """
        Parse an and expression.

        and_expr := expr `and` expr
        """

        if self.check(TokenKind.AND):
            self.match(TokenKind.AND)
            and_expr_rhs = self.parse_expr(and_call=True)
            if not and_expr_rhs:
                self.syntax_error(ErrorKind.ExpectedExpression)
            and_expr = ast.BinaryExpr("and", expr, and_expr_rhs)
            return self.parse_and_expr(and_expr)
        return expr

    def parse_or_expr(self, expr: Operation) -> Operation:
        """
        Parse an or expression.

        or_expr := expr `or` expr
        """

        if self.check(TokenKind.OR):
            self.match(TokenKind.OR)
            or_expr_rhs = self.parse_expr(or_call=True)
            or_expr = ast.BinaryExpr("or", expr, or_expr_rhs)
            return self.parse_or_expr(or_expr)
        return expr

    def parse_optional_expr(self) -> Optional[Operation]:
        """
        Parse an optional expression.

        optional_expr := expr
                      | epsilon
        """

        if self.is_expr_first_set():
            return self.parse_expr()
        return None

    def parse_expr_assign_list(self) -> Optional[Operation]:
        """
        Parse an expression assignment list.

        expr_assign_list := expr
                         |  expr `=` expr_assign_list
        """

        expr = self.parse_expr()
        if self.check(TokenKind.ASSIGN):
            self.match(TokenKind.ASSIGN)
            expr_assign_list = self.parse_expr_assign_list()
            return ast.Assign(expr, expr_assign_list)
        return expr

    def parse_cexpr(
        self,
        neg_call: bool = False,
        mult_call: bool = False,
        add_call: bool = False,
        rel_call: bool = False,
    ) -> Optional[Operation]:
        """
        Parse a compound expression.

        cexpr := ID `(` optional_expr_list `)`
              | ID
              | literal
              | `[` optional_expr_list `]`
              | `(` expr `)`
              | `-` cexpr
              | index_expr
              | cexpr bin_op cexpr
        """

        cexpr = None

        if self.check([TokenKind.IDENTIFIER, TokenKind.LROUNDBRACKET]):
            func = self.match(TokenKind.IDENTIFIER)
            self.match(TokenKind.LROUNDBRACKET)
            optional_expr_list = self.parse_optional_expr_list()
            if not self.check(TokenKind.RROUNDBRACKET):
                self.syntax_error(
                    ErrorKind.TokenNotFound, expected=TokenKind.RROUNDBRACKET
                )
            self.match(TokenKind.RROUNDBRACKET)
            cexpr = ast.CallExpr(func.value, optional_expr_list)
        elif self.check(TokenKind.IDENTIFIER):
            id = self.match(TokenKind.IDENTIFIER)
            cexpr = ast.ExprName(id.value)
        elif (
            self.check(TokenKind.NONE)
            or self.check(TokenKind.TRUE)
            or self.check(TokenKind.FALSE)
            or self.check(TokenKind.INTEGER)
            or self.check(TokenKind.STRING)
        ):
            cexpr = self.parse_literal()
        elif self.check(TokenKind.LSQUAREBRACKET):
            self.match(TokenKind.LSQUAREBRACKET)
            optional_expr_list = self.parse_optional_expr_list()
            if not self.check(TokenKind.RSQUAREBRACKET):
                self.syntax_error(
                    ErrorKind.TokenNotFound, expected=TokenKind.RSQUAREBRACKET
                )
            self.match(TokenKind.RSQUAREBRACKET)
            cexpr = ast.ListExpr(optional_expr_list)
        elif self.check(TokenKind.LROUNDBRACKET):
            self.match(TokenKind.LROUNDBRACKET)
            expr = self.parse_expr()
            if not self.check(TokenKind.RROUNDBRACKET):
                self.syntax_error(
                    ErrorKind.TokenNotFound, expected=TokenKind.RROUNDBRACKET
                )
            self.match(TokenKind.RROUNDBRACKET)
            cexpr = expr
        elif self.check(TokenKind.MINUS):
            cexpr = self.parse_unary_neg()

        # check for index expressions
        if self.check(TokenKind.LSQUAREBRACKET):
            cexpr = self.parse_index_expr(cexpr)

        # check for binary operations
        if self.is_mult_op() and not (neg_call or mult_call):
            cexpr = self.parse_mult_cexpr(cexpr)
        if self.is_add_op() and not (neg_call or mult_call or add_call):
            cexpr = self.parse_add_cexpr(cexpr)
        if self.is_rel_op() and not (neg_call or mult_call or add_call or rel_call):
            cexpr = self.parse_rel_cexpr(cexpr)

        return cexpr

    def parse_unary_neg(self) -> Operation:
        """
        Parse a unary negation.

        unary_neg := `-` cexpr
        """

        self.match(TokenKind.MINUS)
        if self.check(TokenKind.MINUS):
            return ast.UnaryExpr("-", self.parse_unary_neg())
        cexpr = self.parse_cexpr(neg_call=True)
        if not cexpr:
            self.syntax_error(ErrorKind.ExpectedExpression)
        return ast.UnaryExpr("-", cexpr)

    def is_mult_op(self) -> bool:
        """
        Return True if the next token is a multiplication operator.
        """

        return (
            self.check(TokenKind.MUL)
            or self.check(TokenKind.DIV)
            or self.check(TokenKind.MOD)
        )

    def is_add_op(self) -> bool:
        """
        Return True if the next token is an addition operator.
        """

        return self.check(TokenKind.PLUS) or self.check(TokenKind.MINUS)

    def is_rel_op(self) -> bool:
        """
        Return True if the next token is a relational operator.
        """

        return (
            self.check(TokenKind.EQ)
            or self.check(TokenKind.NE)
            or self.check(TokenKind.LE)
            or self.check(TokenKind.GE)
            or self.check(TokenKind.LT)
            or self.check(TokenKind.GT)
            or self.check(TokenKind.IS)
        )

    def parse_mult_cexpr(self, cexpr: Operation) -> Operation:
        """
        Parse a multiplication compound expression.

        mult_cexpr := cexpr mult_op cexpr
        """

        if self.is_mult_op():
            mult_op = self.match_mult_op()
            cexpr_rhs = self.parse_cexpr(mult_call=True)
            mult_expr = ast.BinaryExpr(mult_op, cexpr, cexpr_rhs)
            return self.parse_mult_cexpr(mult_expr)
        return cexpr

    def parse_add_cexpr(self, cexpr: Operation) -> Operation:
        """
        Parse an addition compound expression.

        add_cexpr := cexpr add_op cexpr
        """

        if self.is_add_op():
            add_op = self.match_add_op()
            cexpr_rhs = self.parse_cexpr(add_call=True)
            if not cexpr_rhs:
                self.syntax_error(ErrorKind.ExpectedExpression)
            add_expr = ast.BinaryExpr(add_op, cexpr, cexpr_rhs)
            return self.parse_add_cexpr(add_expr)
        return cexpr

    def parse_rel_cexpr(self, cexpr: Operation, recursion_depth: int = 0) -> Operation:
        """
        Parse a relational compound expression.

        rel_cexpr := cexpr rel_op cexpr
        """

        if self.is_rel_op():
            if recursion_depth > 0:
                self.syntax_error(ErrorKind.ComparisonNotAssociative)
            rel_op = self.match_rel_op()
            cexpr_rhs = self.parse_cexpr(rel_call=True)
            rel_expr = ast.BinaryExpr(rel_op, cexpr, cexpr_rhs)
            return self.parse_rel_cexpr(rel_expr, recursion_depth + 1)
        return cexpr

    def parse_index_expr(self, cexpr: Operation) -> Operation:
        """
        Parse an index expression.

        index_expr := cexpr `[` expr `]`
        """

        self.match(TokenKind.LSQUAREBRACKET)
        expr = self.parse_expr()
        if not expr:
            self.syntax_error(ErrorKind.ExpectedExpression)
        if not self.check(TokenKind.RSQUAREBRACKET):
            self.syntax_error(
                ErrorKind.TokenNotFound, expected=TokenKind.RSQUAREBRACKET
            )
        self.match(TokenKind.RSQUAREBRACKET)
        current_index_expr = ast.IndexExpr(cexpr, expr)
        new_index_expr = None
        while self.check(TokenKind.LSQUAREBRACKET):
            self.match(TokenKind.LSQUAREBRACKET)
            expr = self.parse_expr()
            if not expr:
                self.syntax_error(ErrorKind.ExpectedExpression)
            self.match(TokenKind.RSQUAREBRACKET)
            new_index_expr = ast.IndexExpr(current_index_expr, expr)
            current_index_expr = new_index_expr

        return current_index_expr

    def match_mult_op(self) -> str:
        """
        Consume a multiplication operator.
        """

        if self.check(TokenKind.MUL):
            self.match(TokenKind.MUL)
            return "*"
        elif self.check(TokenKind.DIV):
            self.match(TokenKind.DIV)
            return "//"
        elif self.check(TokenKind.MOD):
            self.match(TokenKind.MOD)
            return "%"
        else:
            raise Exception("Error: Invalid mult_op.")

    def match_add_op(self) -> str:
        """
        Consume an addition operator.
        """

        if self.check(TokenKind.PLUS):
            self.match(TokenKind.PLUS)
            return "+"
        elif self.check(TokenKind.MINUS):
            self.match(TokenKind.MINUS)
            return "-"
        else:
            raise Exception("Error: Invalid add_op.")

    def match_rel_op(self) -> str:
        """
        Consume a relational operator.
        """

        if self.check(TokenKind.EQ):
            self.match(TokenKind.EQ)
            return "=="
        elif self.check(TokenKind.NE):
            self.match(TokenKind.NE)
            return "!="
        elif self.check(TokenKind.LE):
            self.match(TokenKind.LE)
            return "<="
        elif self.check(TokenKind.GE):
            self.match(TokenKind.GE)
            return ">="
        elif self.check(TokenKind.LT):
            self.match(TokenKind.LT)
            return "<"
        elif self.check(TokenKind.GT):
            self.match(TokenKind.GT)
            return ">"
        elif self.check(TokenKind.IS):
            self.match(TokenKind.IS)
            return "is"
        else:
            raise Exception("Error: Invalid rel_op.")

    def parse_optional_expr_list(self) -> List[Operation]:
        """
        Parse an optional expression list.

        optional_expr_list := expr [`,` expr]*
                            | epsilon
        """

        expr_list = []

        if self.is_expr_first_set():
            expr = self.parse_expr()
            expr_list.append(expr)
            while not (
                self.check(TokenKind.RROUNDBRACKET)
                or self.check(TokenKind.RSQUAREBRACKET)
                or self.check(TokenKind.NEWLINE)
            ):
                if not self.check(TokenKind.COMMA):
                    self.syntax_error(ErrorKind.CommaExpected)
                self.match(TokenKind.COMMA)
                expr = self.parse_expr()
                if not expr:
                    self.syntax_error(ErrorKind.ExpectedExpression)
                expr_list.append(expr)

        return expr_list

    def convert_offset(self, token) -> Tuple[int, int, str]:
        """
        Convert the offset of a token to a line and column number and return the relevant line along with them.
        """

        offset = token.offset
        stream: TextIOBase = self.lexer.tokenizer.scanner.stream
        stream.seek(0)
        line, column = 1, 0
        line_literal = ""

        for i, char in enumerate(stream.read()):
            if i == offset - 1 and token.kind == TokenKind.NEWLINE:
                column += 1
                break
            if i > offset - 1 and char == "\n":
                break
            elif i > offset - 1:
                line_literal += char
            elif char == "\n":
                line += 1
                column = 0
                line_literal = ""
            else:
                column += 1
                line_literal += char

        return line, column, line_literal

    def syntax_error(
        self, error_kind: ErrorKind, expected: TokenKind = None, location: str = None
    ) -> None:
        """
        Inform the user about a specific syntax error and exit the program.
        """

        token = self.lexer.peek()
        line, column, line_literal = self.convert_offset(token)

        if error_kind == ErrorKind.CommaExpected:
            if self.is_expr_first_set():
                found = "expression"
            elif self.is_stmt_first_set():
                found = "statement"
            print(
                f"SyntaxError (line {line}, column {column}): {found} found, but comma expected."
            )
        elif error_kind == ErrorKind.ComparisonNotAssociative:
            print(
                f"SyntaxError (line {line}, column {column}): Comparison operators are not associative."
            )
        elif error_kind == ErrorKind.ExpectedExpression:
            print(f"SyntaxError (line {line}, column {column}): Expected expression.")
        elif error_kind == ErrorKind.Indentation:
            print(
                f"SyntaxError (line {line}, column {column}): expected at least one indented statement in {location}."
            )
        elif error_kind == ErrorKind.NoLhsInAssignment:
            print(
                f"SyntaxError (line {line}, column {column}): No left-hand side in assign statement."
            )
        elif error_kind == ErrorKind.TokenNotFound:
            print(
                f"SyntaxError (line {line}, column {column}): token of kind {expected} not found."
            )
        elif error_kind == ErrorKind.UnexpectedIndentation:
            print(
                f"SyntaxError (line {line}, column {column}): Unexpected indentation."
            )
        elif error_kind == ErrorKind.UnknownType:
            print(f"SyntaxError (line {line}, column {column}): Unknown type.")
        elif error_kind == ErrorKind.UnmatchedParantheses:
            print(f"SyntaxError (line {line}, column {column}): unmatched ')'.")
        elif error_kind == ErrorKind.VariableDefinedLater:
            print(
                f"SyntaxError (line {line}, column {column}): Variable declaration after non-declaration statement."
            )

        print(f">>>{line_literal}")
        print(">>>" + "-" * (column - 1) + "^")
        exit(0)
