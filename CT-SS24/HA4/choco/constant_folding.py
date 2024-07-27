# type: ignore

from dataclasses import dataclass

from xdsl.dialects.builtin import IntegerAttr, ModuleOp
from xdsl.ir import MLContext
from xdsl.passes import ModulePass
from xdsl.pattern_rewriter import (
    GreedyRewritePatternApplier,
    PatternRewriter,
    PatternRewriteWalker,
    RewritePattern,
    op_type_rewrite_pattern,
)

from choco.dialects.choco_flat import *
from choco.dialects.choco_type import *


@dataclass
class BinaryExprRewriter(RewritePattern):
    def is_integer_literal(self, op: Operation):
        return isinstance(op, Literal) and isinstance(op.value, IntegerAttr)
    
    def literal_result(self, op: str, lhs: int, rhs: int):
        if op == "+":
            return lhs + rhs
        elif op == "-":
            return lhs - rhs
        elif op == "*":
            return lhs * rhs
        elif op == "//":
            return lhs // rhs
        elif op == "%":
            return lhs % rhs

    def invalid_fold(self, inner_op: str, outer_op: str):
        if inner_op in {"+", "-"} and outer_op == "*":
            return True
        elif inner_op == "*" and outer_op in {"+", "-"}:
            return True
        elif inner_op == "%" or outer_op == "%":
            return True
        elif inner_op == "//" or outer_op == "//":
            return True
        return False

    def get_result_stack(self, value_stack, operation_stack):
        result_stack = []
        subresult = value_stack.pop()

        op = operation_stack.pop()
        next_op = operation_stack.pop()
        while len(value_stack) > 0:
            value = value_stack.pop() 

            if self.invalid_fold(op, next_op):
                result_stack.append(subresult)
                result_stack.append(op)
                subresult = value
                op = next_op
                next_op = operation_stack.pop() if len(operation_stack) > 0 else None
                continue

            subresult = self.literal_result(op, subresult, value)
            op = next_op
            next_op = operation_stack.pop() if len(operation_stack) > 0 else None

        result_stack.append(subresult)
        result_stack.append(op)
        return result_stack

    def result_stack_to_binary_expr(self, result_stack, res_type):
        lhs = result_stack.pop()
        op = StringAttr(result_stack.pop())
        rhs = Literal.get(result_stack.pop())
        current_bin_op = BinaryExpr.create(
            properties={"op": op},
            operands=[lhs.result, rhs.result],
            result_types=[res_type],
        )
        return_instr = [lhs, rhs, current_bin_op]
        readable = ["load", rhs.value.parameters[0].data, op.data]

        final_bin_op = current_bin_op
        while len(result_stack) > 0:
            op = StringAttr(result_stack.pop())
            lhs = current_bin_op
            rhs = Literal.get(result_stack.pop())
            final_bin_op = BinaryExpr.create(
                properties={"op": op},
                operands=[lhs.result, rhs.result],
                result_types=[res_type],
            )
            current_bin_op = final_bin_op
            return_instr.extend([rhs, current_bin_op])
            readable.extend([rhs.value.parameters[0].data, op.data])
        return return_instr, readable
    
    def convert_nested_binary(self, expr: BinaryExpr):
        current_lhs = expr.lhs.op
        value_stack = [expr.rhs.op.value.parameters[0].data]
        operation_stack = [expr.op.data]

        while isinstance(current_lhs, BinaryExpr):
            if self.is_integer_literal(current_lhs.rhs.op):
                rhs_value = current_lhs.rhs.op.value.parameters[0].data
                value_stack.append(rhs_value)
            else:
                value_stack.append("x")
            operation_stack.append(current_lhs.op.data)
            current_lhs = current_lhs.lhs.op

        leftmost = Load.build(operands=[current_lhs.memloc], result_types=[expr.rhs.type])

        if not "x" in value_stack:
            value_stack, operation_stack = value_stack[::-1], operation_stack[::-1]    
            result_stack = self.get_result_stack(value_stack, operation_stack)
            result_stack.append(leftmost)
            new_binary_expr = self.result_stack_to_binary_expr(result_stack, expr.rhs.type)[0]
            return new_binary_expr
        return None

    @op_type_rewrite_pattern
    def match_and_rewrite(  # type: ignore reportIncompatibleMethodOverride
        self, expr: BinaryExpr, rewriter: PatternRewriter
    ) -> None:
        if expr.op.data in {"<", ">", "<=", ">=", "==", "!="}:
            return

        if self.is_integer_literal(expr.lhs.op) and self.is_integer_literal(
            expr.rhs.op
        ):
            lhs_value = expr.lhs.op.value.parameters[0].data
            rhs_value = expr.rhs.op.value.parameters[0].data
            result_value = self.literal_result(expr.op.data, lhs_value, rhs_value)
            new_constant = Literal.get(result_value)
            rewriter.replace_op(expr, [new_constant])

        elif self.is_integer_literal(expr.lhs.op) and isinstance(expr.rhs.op, Load):
            """
                cases:
                    1) 0 + x -> x
                    2) 1 * x -> x
                    3) 0 - x -> -x
                    4) 0 * x -> 0
                    5) 0 // x -> 0
                    6) 0 % x -> 0
            """

            lhs_value = expr.lhs.op.value.parameters[0].data
            if (lhs_value == 0 and expr.op.data == "+") or (
                lhs_value == 1 and expr.op.data == "*"
            ):
                rhs_clone = Load.build(
                    operands=[expr.rhs.op.memloc], result_types=[expr.rhs.type]
                )
                rewriter.replace_matched_op([rhs_clone])
            elif lhs_value == 0 and expr.op.data == "-":
                op_attr = StringAttr("-")
                rhs_negated = UnaryExpr.create(
                    properties={"op": op_attr},
                    operands=[expr.rhs],
                    result_types=[expr.rhs.type],
                )
                rewriter.replace_matched_op([rhs_negated])
            elif (
                (lhs_value == 0 and expr.op.data == "*")
                or (lhs_value == 0 and expr.op.data == "//")
                or (lhs_value == 0 and expr.op.data == "%")
            ):
                rewriter.replace_op(expr, [Literal.get(0)])

        elif self.is_integer_literal(expr.rhs.op) and isinstance(expr.lhs.op, Load):
            """
                cases:
                    1) x + 0 -> x
                    2) x - 0 -> x
                    3) x * 1 -> x
                    4) x // 1 -> x
                    5) x * 0 -> 0
                    6) x % 1 -> 0
            """

            rhs_value = expr.rhs.op.value.parameters[0].data
            if (
                (rhs_value == 0 and expr.op.data == "+")
                or (rhs_value == 0 and expr.op.data == "-")
                or (rhs_value == 1 and expr.op.data == "*")
                or (rhs_value == 1 and expr.op.data == "//")
            ):
                lhs_clone = Load.build(
                    operands=[expr.lhs.op.memloc], result_types=[expr.lhs.type]
                )
                rewriter.replace_matched_op([lhs_clone])
            elif (rhs_value == 0 and expr.op.data == "*") or (
                rhs_value == 1 and expr.op.data == "%"
            ):
                rewriter.replace_op(expr, [Literal.get(0)])

        elif isinstance(expr.lhs.op, Load) and isinstance(expr.rhs.op, Load):
            """
                cases:
                    1) x - x -> 0
                    2) x % x -> 0
                    3) x // x -> 1
            """

            if expr.lhs.op.memloc == expr.rhs.op.memloc:
                if expr.op.data == "-" or expr.op.data == "%":
                    rewriter.replace_op(expr, [Literal.get(0)])
                elif expr.op.data == "//":
                    rewriter.replace_op(expr, [Literal.get(1)])

        elif isinstance(expr.lhs.op, BinaryExpr) and self.is_integer_literal(expr.lhs.op.rhs.op) and self.is_integer_literal(expr.rhs.op):
            lhs_binary = expr.lhs.op

            if isinstance(lhs_binary.lhs.op, Load) and self.is_integer_literal(lhs_binary.rhs.op):
                """
                    cases:
                        1) x + 1 + 2 -> x + 3
                        2) x - 1 - 2 -> x - 3
                        3) x * 2 * 3 -> x * 6
                        ...
                """

                if not self.invalid_fold(lhs_binary.op.data, expr.op.data):
                    rhs_value = lhs_binary.rhs.op.value.parameters[0].data
                    outer_rhs_value = expr.rhs.op.value.parameters[0].data
                    result_value = self.literal_result(expr.op.data, rhs_value, outer_rhs_value)

                    new_load = Load.build(
                        operands=[lhs_binary.lhs.op.memloc], result_types=[lhs_binary.lhs.type]
                    )
                    new_literal = Literal.get(result_value)
                    new_binary = BinaryExpr.create(
                        properties={"op": StringAttr(lhs_binary.op.data)},
                        operands=[new_load.result, new_literal.result],
                        result_types=[lhs_binary.rhs.type],
                    )
                    rewriter.replace_op(expr, [new_load, new_literal, new_binary])

            elif isinstance(lhs_binary.lhs.op, BinaryExpr) and self.is_integer_literal(expr.rhs.op):
                """
                    cases:
                        1) x + 1 + 2 * 4 -> x + 1 + 8
                        2) x - 1 - 2 + 4 -> x + 1
                        ...
                """

                new_bin = self.convert_nested_binary(expr)
                if new_bin:
                    rewriter.replace_op(expr, new_bin)
        return


class ChocoFlatConstantFolding(ModulePass):
    name = "choco-flat-constant-folding"

    def apply(self, ctx: MLContext, op: ModuleOp) -> None:
        walker = PatternRewriteWalker(
            GreedyRewritePatternApplier(
                [
                    BinaryExprRewriter(),
                ]
            ), walk_reverse=True
        )

        walker.rewrite_module(op)
