from dataclasses import dataclass
from enum import Enum
from io import StringIO

from xdsl.dialects.builtin import ModuleOp
from xdsl.ir import MLContext
from xdsl.passes import ModulePass
from xdsl.printer import Printer

from choco.ast_visitor import Visitor
from choco.dialects.choco_ast import *


class ErrorType(Enum):
    UNREACHABLE = 1
    UNREACHABLE_EXPR = 2
    UNUSED_STORE = 3
    UNUSED_VAR = 4
    UNUSED_ARG = 5
    UNUSED_FUNC = 6
    UNUSED_EXPR = 7


class DeadCodeError(Exception):
    pass


@dataclass
class UnreachableStatementsError(DeadCodeError):
    """Raised when some statements are unreachable."""

    def __str__(self) -> str:
        return "Program contains unreachable statements."


@dataclass
class UnreachableExpressionError(DeadCodeError):
    """Raised when parts of an expression is unreachable."""

    def __str__(self) -> str:
        return "Program contains unreachable expressions."


@dataclass
class UnusedStoreError(DeadCodeError):
    """Raised when a store operation is unused."""

    op: Assign

    def __str__(self) -> str:
        stream = StringIO()
        printer = Printer(stream=stream)
        print("The following store operation is unused: ", file=stream)
        printer.print_op(self.op)
        return stream.getvalue()


@dataclass
class UnusedVariableError(DeadCodeError):
    """Raised when a variable is unused."""

    name: str

    def __str__(self) -> str:
        return f"The following variable is unused: {self.name}."


@dataclass
class UnusedArgumentError(DeadCodeError):
    """Raised when a function argument is unused."""

    name: str

    def __str__(self) -> str:
        return f"The following function argument is unused: {self.name}."


@dataclass
class UnusedFunctionError(DeadCodeError):
    """Raised when a function is unused."""

    name: str

    def __str__(self) -> str:
        return f"The following function is unused: {self.name}."


@dataclass
class UnusedExpressionError(DeadCodeError):
    """Raised when the result of an expression is unused."""

    expr: Operation

    def __str__(self) -> str:
        stream = StringIO()
        printer = Printer(stream=stream)
        print("The following expression is unused: ", file=stream)
        printer.print_op(self.expr)
        return stream.getvalue()


class WarnDeadCode(ModulePass):
    name = "warn-dead-code"

    def apply(self, ctx: MLContext, op: ModuleOp) -> None:
        program = op.ops.first
        assert isinstance(program, Program)

        @dataclass
        class DeadCodeVisitor(Visitor):

            stores: any = None
            unused_var_defs: any = None
            unused_func_defs: any = None
            unused_params: any = None
            func_def_last_stmt: any = None
            root_is_last: bool = False

            def visit_var_def(self, var_def: VarDef):
                typed_var = var_def.typed_var.blocks[0].ops.first
                assert isinstance(typed_var, TypedVar)
                self.unused_var_defs[typed_var.var_name.data] = var_def

            def visit_assign(self, assign: Assign):
                self.traverse(assign.value.op)
                if isinstance(assign.value.op, ExprName):
                    self.consume_var(assign.value.op)

                target_name = assign.target.op.id.data
                if target_name in self.unused_var_defs:
                    del self.unused_var_defs[target_name]
                if self.unused_params and target_name in self.unused_params:
                    del self.unused_params[target_name]

                if target_name in self.stores:
                    self.warn(ErrorType.UNUSED_STORE, self.stores[target_name])
                self.stores[target_name] = assign

            def visit_return(self, return_op: Return):
                if len(return_op.value.ops) > 0:
                    return_val = return_op.value.op
                    self.traverse(return_val)
                    self.consume_var(return_val)

            def visit_call_expr(self, call: Operation):
                func_name = call.func.data
                if func_name in self.unused_func_defs:
                    self.unused_func_defs.remove(func_name)

                for arg in call.args.ops:
                    self.consume_var(arg)

            def visit_binary_expr(self, binary_expr: Operation):
                if binary_expr.op.data == "and":
                    if isinstance(binary_expr.lhs.op, Literal):
                        if binary_expr.lhs.op.value.data == False:
                            self.warn(ErrorType.UNREACHABLE_EXPR)
                lhs, rhs = binary_expr.lhs.op, binary_expr.rhs.op
                self.consume_var(lhs)
                self.consume_var(rhs)

            def visit_if_expr(self, if_expr: IfExpr):
                if isinstance(if_expr.cond.op, Literal):
                    if if_expr.cond.op.value.data == True:
                        self.warn(ErrorType.UNREACHABLE_EXPR)

            def traverse_func_def(self, func_def: FuncDef):
                params = dict()
                for op in func_def.params.blocks[0].ops:
                    assert isinstance(op, TypedVar)
                    params[op.var_name.data] = op

                body_ops = list(func_def.func_body.blocks[0].ops)
                for i, op in enumerate(body_ops):
                    if self.is_cexpr(op):
                        self.warn(ErrorType.UNUSED_EXPR, op)
                    elif isinstance(op, Return) and i != len(body_ops) - 1:
                        self.warn(ErrorType.UNREACHABLE)
                    self.check_returning_if(op, i, len(body_ops) - 1)

                self.unused_params = params
                self.func_def_last_stmt = body_ops[-1]

                for op in body_ops:
                    self.traverse(op)
                if self.unused_params:
                    first_unused = list(self.unused_params.keys())[0]
                    self.warn(ErrorType.UNUSED_ARG, first_unused)

                self.root_is_last = False

            def traverse_while(self, while_stmt: While):
                if while_stmt == self.func_def_last_stmt:
                    self.root_is_last = True

                self.traverse(while_stmt.cond.op)

                body_ops = list(while_stmt.body.blocks[0].ops)
                if not self.check_pass_block(body_ops):
                    self.check_always_false(while_stmt.cond.op)
                    for i, op in enumerate(body_ops):
                        self.traverse(op)
                        self.check_return(op, i, len(body_ops) - 1)
                        self.check_returning_if(op, i, len(body_ops) - 1)

            def traverse_for(self, for_stmt: For):
                if for_stmt == self.func_def_last_stmt:
                    self.root_is_last = True

                body_ops = list(for_stmt.body.blocks[0].ops)
                if not self.check_pass_block(body_ops):
                    for i, op in enumerate(body_ops):
                        self.traverse(op)
                        self.check_return(op, i, len(body_ops) - 1)
                        self.check_returning_if(op, i, len(body_ops) - 1)

            def traverse_if(self, if_else: If):
                if if_else == self.func_def_last_stmt:
                    self.root_is_last = True

                self.traverse(if_else.cond.op)

                body_ops = list(if_else.then.blocks[0].ops)
                if not self.check_pass_block(body_ops):
                    self.check_always_false(if_else.cond.op)
                    for i, op in enumerate(body_ops):
                        self.traverse(op)
                        self.check_return(op, i, len(body_ops) - 1)
                        self.check_returning_if(op, i, len(body_ops) - 1)

                if if_else.orelse:
                    else_body_ops = list(if_else.orelse.blocks[0].ops)
                    if not self.check_pass_block(else_body_ops):
                        self.check_always_true(if_else.cond.op)
                        for i, op in enumerate(else_body_ops):
                            self.traverse(op)
                            self.check_return(op, i, len(else_body_ops) - 1)
                            self.check_returning_if(op, i, len(else_body_ops) - 1)

            # HELPER FUNCTIONS
            def check_pass_block(self, block):
                if len(block) == 1 and isinstance(block[0], Pass):
                    return True
                return False

            def check_return(self, op, op_i, last_op_i):
                if isinstance(op, Return) and self.root_is_last and op_i != last_op_i:
                    self.warn(ErrorType.UNREACHABLE)

            def check_returning_if(self, op, op_i, last_op_i):
                if isinstance(op, If):
                    blocks = self.unroll_if_stmt(op)
                    if len(blocks) > 1:
                        if all(
                            any(isinstance(op, Return) for op in block)
                            for block in blocks
                        ):
                            if op_i != last_op_i:
                                self.warn(ErrorType.UNREACHABLE)

            def unroll_if_stmt(self, if_stmt):
                if len(list(if_stmt.orelse.ops)) == 0:
                    return [list(if_stmt.then.ops)]

                blocks = []
                current_if_stmt = if_stmt
                while isinstance(current_if_stmt, If):
                    blocks.append(current_if_stmt.then.ops)
                    if isinstance(list(current_if_stmt.orelse.ops)[0], If):
                        current_if_stmt = list(current_if_stmt.orelse.ops)[0]
                    else:
                        current_if_stmt = current_if_stmt.orelse.ops
                blocks.append(current_if_stmt)
                return [list(block) for block in blocks]

            def check_always_false(self, op):
                if isinstance(op, Literal):
                    if op.value.data == False:
                        self.warn(ErrorType.UNREACHABLE)
                elif isinstance(op, BinaryExpr):
                    if op.op.data == "==":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data != op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "!=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data == op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "<":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data >= op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == ">":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data <= op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "<=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data > op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == ">=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data < op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "and":
                        if isinstance(op.lhs.op, Literal):
                            if op.lhs.op.value.data == False:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.rhs.op, Literal):
                            if op.rhs.op.value.data == False:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "or":
                        if (
                            isinstance(op.lhs.op, Literal)
                            and isinstance(op.rhs.op, Literal)
                            and (
                                op.lhs.op.value.data == False
                                and op.rhs.op.value.data == False
                            )
                        ):
                            self.warn(ErrorType.UNREACHABLE)

            def check_always_true(self, op):
                if isinstance(op, Literal):
                    if op.value.data == True:
                        self.warn(ErrorType.UNREACHABLE)
                elif isinstance(op, BinaryExpr):
                    if op.op.data == "==":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data == op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "!=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data != op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "<":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data < op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == ">":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data > op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "<=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data <= op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == ">=":
                        if isinstance(op.lhs.op, Literal) and isinstance(
                            op.rhs.op, Literal
                        ):
                            if op.lhs.op.value.data >= op.rhs.op.value.data:
                                self.warn(ErrorType.UNREACHABLE)
                        elif isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "and":
                        if (
                            isinstance(op.lhs.op, Literal)
                            and op.lhs.op.value.data == True
                            and isinstance(op.rhs.op, Literal)
                            and op.rhs.op.value.data == True
                        ):
                            self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "or":
                        if (
                            isinstance(op.lhs.op, Literal)
                            and isinstance(op.rhs.op, Literal)
                            and (
                                op.lhs.op.value.data == True
                                or op.rhs.op.value.data == True
                            )
                        ):
                            self.warn(ErrorType.UNREACHABLE)
                    elif op.op.data == "is":
                        if isinstance(op.lhs.op, ExprName) and isinstance(
                            op.rhs.op, ExprName
                        ):
                            if op.lhs.op.id.data == op.rhs.op.id.data:
                                self.warn(ErrorType.UNREACHABLE)

            def warn(self, err_type, err_content=None):
                if err_type == ErrorType.UNREACHABLE:
                    print("[Warning] Dead code found: ", UnreachableStatementsError())
                elif err_type == ErrorType.UNREACHABLE_EXPR:
                    print(
                        "[Warning] Dead code found: ",
                        UnreachableExpressionError(),
                    )
                elif err_type == ErrorType.UNUSED_STORE:
                    print(
                        "[Warning] Dead code found: ",
                        UnusedStoreError(err_content),
                    )
                elif err_type == ErrorType.UNUSED_VAR:
                    print(
                        "[Warning] Dead code found: ",
                        UnusedVariableError(err_content),
                    )
                elif err_type == ErrorType.UNUSED_ARG:
                    print(
                        "[Warning] Dead code found: ",
                        UnusedArgumentError(err_content),
                    )
                elif err_type == ErrorType.UNUSED_FUNC:
                    print(
                        "[Warning] Dead code found: ",
                        UnusedFunctionError(err_content),
                    )
                elif err_type == ErrorType.UNUSED_EXPR:
                    print(
                        "[Warning] Dead code found: ",
                        UnusedExpressionError(err_content),
                    )
                else:
                    raise ValueError("Invalid error type.")

            def consume_var(self, op):
                if isinstance(op, ExprName):
                    consumed_var = op.id.data
                    if consumed_var in self.unused_var_defs:
                        del self.unused_var_defs[consumed_var]
                    if self.unused_params and consumed_var in self.unused_params:
                        del self.unused_params[consumed_var]
                    if consumed_var in self.stores:
                        del self.stores[consumed_var]

            def is_cexpr(self, op):
                return (
                    isinstance(op, Literal)
                    or isinstance(op, ExprName)
                    or isinstance(op, BinaryExpr)
                    or isinstance(op, CallExpr)
                    or isinstance(op, IndexExpr)
                    or isinstance(op, UnaryExpr)
                    or isinstance(op, ListExpr)
                    or isinstance(op, IfExpr)
                )

        # gather all function definitions
        function_defs = set()
        for op in program.stmts.ops:
            if isinstance(op, FuncDef):
                function_defs.add(op.func_name.data)

        # traverse the program using the DeadCodeVisitor
        dcv = DeadCodeVisitor(
            stores=dict(), unused_var_defs=dict(), unused_func_defs=function_defs
        )
        dcv.traverse(op)
        if dcv.unused_func_defs:
            first_unused = list(dcv.unused_func_defs)[0]
            dcv.warn(ErrorType.UNUSED_FUNC, first_unused)
        if dcv.unused_var_defs:
            first_unused = list(dcv.unused_var_defs.keys())[0]
            dcv.warn(ErrorType.UNUSED_VAR, first_unused)
        if dcv.stores:
            first_unused = list(dcv.stores.keys())[0]
            dcv.warn(ErrorType.UNUSED_STORE, dcv.stores[first_unused])

        # check for dead code in the global scope
        for i, op in enumerate(program.stmts.ops):
            if dcv.is_cexpr(op) and not isinstance(op, CallExpr):
                dcv.warn(ErrorType.UNUSED_EXPR, op)
            else:
                dcv.check_returning_if(op, i, len(program.stmts.ops) - 1)
