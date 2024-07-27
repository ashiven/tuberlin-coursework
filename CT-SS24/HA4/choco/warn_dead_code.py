from dataclasses import dataclass
from io import StringIO

from xdsl.dialects.builtin import ModuleOp
from xdsl.ir import MLContext
from xdsl.passes import ModulePass
from xdsl.printer import Printer

from choco.ast_visitor import Visitor
from choco.dialects.choco_ast import *


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
        class AssociativityFoldingVisitor(Visitor):

            def visit_binary_expr(self, binary_expr: BinaryExpr):

                if isinstance(binary_expr.lhs.op, BinaryExpr) and not isinstance(
                    binary_expr.rhs.op, BinaryExpr
                ):
                    unrolled_vals, unrolled_ops = self.unroll_binary_expr(binary_expr)
                    new_lhs, new_rhs = self.fold_constants(unrolled_vals, unrolled_ops)

                    binary_expr.add_region(Region(Block([new_lhs])))
                    binary_expr.add_region(Region(Block([new_rhs])))
                    binary_expr.detach_region(0)
                    binary_expr.detach_region(0)
                    binary_expr.op = StringAttr(unrolled_ops[0])

            def unroll_binary_expr(self, binary_expr: BinaryExpr):
                unrolled_vals = [binary_expr.rhs.op]
                unrolled_ops = [binary_expr.op.data]
                temp_lhs = binary_expr.lhs.op
                while isinstance(temp_lhs, BinaryExpr):
                    unrolled_vals.append(temp_lhs.rhs.op)
                    unrolled_ops.append(temp_lhs.op.data)
                    temp_lhs = temp_lhs.lhs.op
                unrolled_vals.append(temp_lhs)
                # [Literal(16), Literal(4), ExprName(x)]
                # ["+", "+"]
                unrolled_vals.reverse()
                unrolled_ops.reverse()
                # [ExprName(x), Literal(4), Literal(16)]
                # ["+", "+"]
                return unrolled_vals, unrolled_ops

            def fold_constants(self, unrolled_vals, unrolled_ops):
                new_lhs = ExprName(unrolled_vals[0].id.data)
                new_rhs = None
                res_str = str(unrolled_vals[1].value.parameters[0].data)

                print([val.value.parameters[0].data for val in unrolled_vals[1:]])
                print(unrolled_ops)

                for val, op in zip(unrolled_vals[2:], unrolled_ops[1:]):
                    res_str += op
                    res_str += str(val.value.parameters[0].data)

                print(res_str)

                new_rhs = Literal(eval(res_str))
                return new_lhs, new_rhs

        # AssociativityFoldingVisitor().traverse(op)
