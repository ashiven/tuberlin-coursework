# type: ignore

from xdsl.dialects.builtin import ModuleOp
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
from riscv.ssa_dialect import *


class LiteralPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, op: Literal, rewriter: PatternRewriter):
        value = op.value

        if isinstance(value, StringAttr):
            string = value.data

            size_in_bytes = LIOp((len(string) + 1) * 4)  # +1 for the size
            string_ptr = CallOp("_malloc", [size_in_bytes])

            size = LIOp(len(string))
            size_store = SWOp(size, string_ptr, 0)

            char_stores, ascii_vals = [], []
            for i, char in enumerate(string):
                ascii_val = LIOp(ord(char))
                char_store = SWOp(ascii_val, string_ptr, (i + 1) * 4)
                ascii_vals.append(ascii_val)
                char_stores.append(char_store)

            string_ptr_return = AddIOp(string_ptr, 0)

            rewriter.replace_op(
                op,
                ascii_vals
                + [
                    size_in_bytes,
                    string_ptr,
                    size,
                    size_store,
                ]
                + char_stores
                + [string_ptr_return],
            )
            return

        constant = None
        if isinstance(value, IntegerAttr):
            constant = LIOp(op.value)
        if isinstance(value, BoolAttr):
            if value.data == True:
                constant = LIOp(1)
            else:
                constant = LIOp(0)
        if isinstance(value, NoneAttr):
            constant = LIOp(0)

        rewriter.replace_op(op, [constant])
        return


class CallPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, op: CallExpr, rewriter: PatternRewriter):
        if op.func_name.data == "len":
            zero = LIOp(0)
            maybe_fail = BEQOp(op.args[0], zero, f"_error_len_none")
            read_size = LWOp(op.args[0], 0)
            rewriter.replace_op(op, [zero, maybe_fail, read_size])
            return

        call = CallOp(op.func_name, op.args, has_result=bool(len(op.results)))
        rewriter.replace_op(op, [call])
        return


class AllocPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, alloc_op: Alloc, rewriter: PatternRewriter):
        alloc = AllocOp()
        rewriter.replace_op(alloc_op, [alloc])
        return


class StorePattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, store_op: Store, rewriter: PatternRewriter):
        store = SWOp(store_op.value, store_op.memloc, 0)
        rewriter.replace_op(store_op, [store])
        return


class LoadPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, load_op: Load, rewriter: PatternRewriter):
        load = LWOp(load_op.memloc, 0)
        rewriter.replace_op(load_op, [load])
        return


class UnaryExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, unary_op: UnaryExpr, rewriter: PatternRewriter):
        if unary_op.op.data == "-":
            zero = LIOp(0)
            negated = SubOp(zero, unary_op.value)
            rewriter.replace_op(unary_op, [zero, negated])
            return

        if unary_op.op.data == "not":
            true = LIOp(1)
            negated = XOROp(unary_op.value, true)
            rewriter.replace_op(unary_op, [true, negated])
            return


class BinaryExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, bin_op: BinaryExpr, rewriter: PatternRewriter):
        # ARITHMETIC
        if bin_op.op.data == "+":
            add = AddOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [add])
            return
        if bin_op.op.data == "-":
            sub = SubOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [sub])
            return
        if bin_op.op.data == "*":
            mul = MULOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [mul])
            return
        if bin_op.op.data == "//":
            div = DIVOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [div])
            return
        if bin_op.op.data == "%":
            mod = REMOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [mod])
            return
        # COMPARISON
        if bin_op.op.data == "<":
            less = SLTOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [less])
            return
        if bin_op.op.data == ">=":
            true = LIOp(1)
            less = SLTOp(bin_op.lhs, bin_op.rhs)
            greater_equal = XOROp(less, true)
            rewriter.replace_op(bin_op, [true, less, greater_equal])
            return
        if bin_op.op.data == ">":
            greater = SLTOp(bin_op.rhs, bin_op.lhs)
            rewriter.replace_op(bin_op, [greater])
            return
        if bin_op.op.data == "<=":
            true = LIOp(1)
            greater = SLTOp(bin_op.rhs, bin_op.lhs)
            less_equal = XOROp(greater, true)
            rewriter.replace_op(bin_op, [true, greater, less_equal])
            return
        if bin_op.op.data == "==":
            true = LIOp(1)
            less = SLTOp(bin_op.lhs, bin_op.rhs)
            greater = SLTOp(bin_op.rhs, bin_op.lhs)
            not_equal = XOROp(less, greater)
            equal = XOROp(not_equal, true)
            rewriter.replace_op(bin_op, [true, less, greater, not_equal, equal])
            return
        if bin_op.op.data == "!=":
            less = SLTOp(bin_op.lhs, bin_op.rhs)
            greater = SLTOp(bin_op.rhs, bin_op.lhs)
            not_equal = XOROp(less, greater)
            rewriter.replace_op(bin_op, [less, greater, not_equal])
            return
        if bin_op.op.data == "is":
            # 'is' returns true if the two objects are the same object
            # meaning that lhs and rhs contain the same address
            # it also returns true if both are None (represented as 0)
            true = LIOp(1)
            less = SLTOp(bin_op.lhs, bin_op.rhs)
            greater = SLTOp(bin_op.rhs, bin_op.lhs)
            not_equal = XOROp(less, greater)
            equal = XOROp(not_equal, true)
            rewriter.replace_op(bin_op, [true, less, greater, not_equal, equal])
            return


class IfPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, if_op: If, rewriter: PatternRewriter):
        zero = LIOp(0)
        maybe_fail = BEQOp(if_op.cond, zero, f"if_else_{self.counter}")
        if_then_label = LabelOp(f"if_then_{self.counter}")
        jump_after = JOp(f"if_after_{self.counter}")
        if_else_label = LabelOp(f"if_else_{self.counter}")
        if_after_label = LabelOp(f"if_after_{self.counter}")

        rewriter.insert_op_before_matched_op([zero, maybe_fail, if_then_label])
        rewriter.inline_block_before_matched_op(if_op.then)
        rewriter.insert_op_before_matched_op([jump_after, if_else_label])
        rewriter.inline_block_before_matched_op(if_op.orelse)
        rewriter.insert_op_before_matched_op([if_after_label])
        rewriter.erase_matched_op()

        self.counter += 1
        return


class AndPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, and_op: EffectfulBinaryExpr, rewriter: PatternRewriter):
        if and_op.op.data == "and":
            true = LIOp(1)
            lhs_yield = and_op.lhs.ops.last.value
            rhs_yield = and_op.rhs.ops.last.value
            and_res = ANDOp(lhs_yield, rhs_yield)

            branch = BEQOp(lhs_yield, true, f"and_else_{self.counter}")
            jump_to_end = JOp(f"and_end_{self.counter}")
            and_else_label = LabelOp(f"and_else_{self.counter}")
            and_end_label = LabelOp(f"and_end_{self.counter}")

            res_var = AllocOp()
            lhs_store = SWOp(lhs_yield, res_var, 0)
            and_res_store = SWOp(and_res, res_var, 0)
            res_var_load = LWOp(res_var, 0)

            rewriter.insert_op_before_matched_op([res_var, true])
            rewriter.inline_block_before_matched_op(and_op.lhs)
            rewriter.insert_op_before_matched_op(
                [branch, lhs_store, jump_to_end, and_else_label]
            )
            rewriter.inline_block_before_matched_op(and_op.rhs)
            rewriter.insert_op_before_matched_op(
                [and_res, and_res_store, and_end_label]
            )
            rewriter.replace_matched_op([res_var_load])

            self.counter += 1
            return


class OrPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, or_op: EffectfulBinaryExpr, rewriter: PatternRewriter):
        if or_op.op.data == "or":
            false = LIOp(0)
            lhs_yield = or_op.lhs.ops.last.value
            rhs_yield = or_op.rhs.ops.last.value
            or_res = OROp(lhs_yield, rhs_yield)

            branch = BEQOp(lhs_yield, false, f"or_else_{self.counter}")
            jump_to_end = JOp(f"or_end_{self.counter}")
            or_else_label = LabelOp(f"or_else_{self.counter}")
            or_end_label = LabelOp(f"or_end_{self.counter}")

            res_var = AllocOp()
            lhs_store = SWOp(lhs_yield, res_var, 0)
            or_res_store = SWOp(or_res, res_var, 0)
            res_var_load = LWOp(res_var, 0)

            rewriter.insert_op_before_matched_op([res_var, false])
            rewriter.inline_block_before_matched_op(or_op.lhs)
            rewriter.insert_op_before_matched_op(
                [branch, lhs_store, jump_to_end, or_else_label]
            )
            rewriter.inline_block_before_matched_op(or_op.rhs)
            rewriter.insert_op_before_matched_op([or_res, or_res_store, or_end_label])
            rewriter.replace_matched_op([res_var_load])

            self.counter += 1
            return


class IfExprPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, if_op: IfExpr, rewriter: PatternRewriter):
        false = LIOp(0)
        then_yield = if_op.then.ops.last.value
        else_yield = if_op.or_else.ops.last.value

        branch = BEQOp(if_op.cond, false, f"if_else_{self.counter}")
        jump_to_end = JOp(f"if_end_{self.counter}")
        if_else_label = LabelOp(f"if_else_{self.counter}")
        if_end_label = LabelOp(f"if_end_{self.counter}")

        res_var = AllocOp()
        then_store = SWOp(then_yield, res_var, 0)
        else_store = SWOp(else_yield, res_var, 0)
        res_var_load = LWOp(res_var, 0)

        rewriter.insert_op_before_matched_op(
            [
                res_var,
                false,
                branch,
            ]
        )
        rewriter.inline_block_before_matched_op(if_op.then)
        rewriter.insert_op_before_matched_op([then_store, jump_to_end, if_else_label])
        rewriter.inline_block_before_matched_op(if_op.or_else)
        rewriter.insert_op_before_matched_op([else_store, if_end_label])
        rewriter.replace_matched_op([res_var_load])

        self.counter += 1
        return


class WhilePattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, while_op: While, rewriter: PatternRewriter):
        false = LIOp(0)
        cond_yield = while_op.cond.ops.last.value

        branch = BEQOp(cond_yield, false, f"while_end_{self.counter}")
        jump_to_cond = JOp(f"while_cond_{self.counter}")
        while_cond_label = LabelOp(f"while_cond_{self.counter}")
        while_end_label = LabelOp(f"while_end_{self.counter}")

        rewriter.insert_op_before_matched_op([false, while_cond_label])
        rewriter.inline_block_before_matched_op(while_op.cond)
        rewriter.insert_op_before_matched_op([branch])
        rewriter.inline_block_before_matched_op(while_op.body)
        rewriter.insert_op_before_matched_op([jump_to_cond, while_end_label])
        rewriter.erase_matched_op()

        self.counter += 1
        return


class ListExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, list_expr: ListExpr, rewriter: PatternRewriter):
        size_in_bytes = LIOp((len(list_expr.elems) + 1) * 4)  # +1 for the size
        list_ptr = CallOp("_malloc", [size_in_bytes])

        size = LIOp(len(list_expr.elems))
        size_store = SWOp(size, list_ptr, 0)

        elem_stores = []
        for i, elem in enumerate(list_expr.elems):
            elem_store = SWOp(elem, list_ptr, (i + 1) * 4)
            elem_stores.append(elem_store)

        list_ptr_return = AddIOp(list_ptr, 0)

        rewriter.replace_op(
            list_expr,
            [
                size_in_bytes,
                list_ptr,
                size,
                size_store,
            ]
            + elem_stores
            + [list_ptr_return],
        )
        return


class GetAddressPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, get_address: GetAddress, rewriter: PatternRewriter):
        zero = LIOp(0)
        branch_list_is_none = BEQOp(get_address.value, zero, f"_list_index_none")

        size = LWOp(get_address.value, 0)
        branch_oob = BGEOp(get_address.index, size, f"_list_index_oob")
        branch_oob_negative = BLTOp(get_address.index, zero, f"_list_index_oob")

        adjust_index_skip_len = AddIOp(get_address.index, 1)
        byte_offset = LIOp(4)
        index_to_bytes = MULOp(adjust_index_skip_len, byte_offset)
        updated_address = AddOp(get_address.value, index_to_bytes)

        rewriter.replace_op(
            get_address,
            [
                zero,
                branch_list_is_none,
                size,
                branch_oob,
                branch_oob_negative,
                adjust_index_skip_len,
                byte_offset,
                index_to_bytes,
                updated_address,
            ],
        )
        return


class IndexStringPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, indexString: IndexString, rewriter: PatternRewriter):
        zero = LIOp(0)
        branch_list_is_none = BEQOp(indexString.value, zero, f"_list_index_none")

        size = LWOp(indexString.value, 0)
        branch_oob = BGEOp(indexString.index, size, f"_list_index_oob")
        branch_oob_negative = BLTOp(indexString.index, zero, f"_list_index_oob")

        adjust_index_skip_len = AddIOp(indexString.index, 1)
        byte_offset = LIOp(4)
        index_to_bytes = MULOp(adjust_index_skip_len, byte_offset)
        updated_address = AddOp(indexString.value, index_to_bytes)

        # create a single char string and return a variable storing it's address
        # this is needed because print_str expects a string (it reads the size from the first 4 bytes)
        char_val = LWOp(updated_address, 0)
        char_size_bytes = LIOp(8)
        char_ptr = CallOp("_malloc", [char_size_bytes])
        char_size = LIOp(1)
        size_store = SWOp(char_size, char_ptr, 0)
        char_ptr_store = SWOp(char_val, char_ptr, 4)

        return_alloc = AllocOp()
        return_store = SWOp(char_ptr, return_alloc, 0)
        return_val = AddIOp(return_alloc, 0)

        rewriter.replace_op(
            indexString,
            [
                zero,
                branch_list_is_none,
                size,
                branch_oob,
                branch_oob_negative,
                adjust_index_skip_len,
                byte_offset,
                index_to_bytes,
                updated_address,
                char_val,
                char_size_bytes,
                char_ptr,
                char_size,
                size_store,
                char_ptr_store,
                return_alloc,
                return_store,
                return_val,
            ],
        )
        return


class YieldPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, get_address: Yield, rewriter: PatternRewriter):
        rewriter.erase_matched_op()


class FuncDefPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, func: FuncDef, rewriter: PatternRewriter):
        new_func = FuncOp.create(
            result_types=[],
            properties={"func_name": StringAttr(func.func_name.data)},
        )

        new_region = rewriter.move_region_contents_to_new_regions(func.func_body)
        new_func.add_region(new_region)
        for arg in new_region.blocks[0].args:
            rewriter.modify_block_argument_type(arg, RegisterType())

        rewriter.replace_op(func, [new_func])


class ReturnPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, ret: Return, rewriter: PatternRewriter):
        ret = ReturnOp(ret.value)
        rewriter.replace_matched_op([ret])


class ChocoFlatToRISCVSSA(ModulePass):
    name = "choco-flat-to-riscv-ssa"

    def apply(self, ctx: MLContext, op: ModuleOp) -> None:
        walker = PatternRewriteWalker(
            GreedyRewritePatternApplier(
                [
                    LiteralPattern(),
                    CallPattern(),
                    UnaryExprPattern(),
                    BinaryExprPattern(),
                    StorePattern(),
                    LoadPattern(),
                    AllocPattern(),
                    IfPattern(),
                    AndPattern(),
                    OrPattern(),
                    IfExprPattern(),
                    WhilePattern(),
                    ListExprPattern(),
                    GetAddressPattern(),
                    IndexStringPattern(),
                    FuncDefPattern(),
                    ReturnPattern(),
                ]
            ),
            apply_recursively=True,
        )

        walker.rewrite_module(op)

        walker = PatternRewriteWalker(
            GreedyRewritePatternApplier(
                [
                    YieldPattern(),
                ]
            ),
            apply_recursively=True,
        )

        walker.rewrite_module(op)
