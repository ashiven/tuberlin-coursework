# type: ignore

from xdsl.dialects.builtin import ModuleOp
from xdsl.ir import (
    MLContext,
)
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
        if isinstance(value, IntegerAttr):
            constant = LIOp(op.value)
            rewriter.replace_op(op, [constant])
            return

        if isinstance(value, BoolAttr):
            if value.data == True:
                constant = LIOp(1)
            if value.data == False:
                constant = LIOp(0)
            rewriter.replace_op(op, [constant])
            return

        if isinstance(value, NoneAttr):
            constant = LIOp(0)
            rewriter.replace_op(op, [constant])
            return

        if isinstance(value, StringAttr):
            size = LIOp(len(value.data) * 4 + 4)
            call = CallOp("_malloc", [size], comment="allocate memory for a string")
            elements = LIOp(len(value.data))
            store_elements = SWOp(
                elements,
                call,
                0,
                f"string literal: store the number of characters at the beginning of the string",
            )
            new_ops = [size, call, elements, store_elements]
            ptr = call.results[0]

            i = 0
            for character in value.data:
                ascii_char = LIOp(ord(character))
                new_ops.append(ascii_char)
                new_ops.append(
                    SWOp(
                        ascii_char,
                        ptr,
                        4 * (i + 1),
                        f"string literal: store character {character} into string",
                    )
                )
                i += 1
            rewriter.replace_op(op, new_ops, [ptr])
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


class AllocPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, alloc_op: Alloc, rewriter: PatternRewriter):
        alloc = AllocOp()
        rewriter.replace_op(alloc_op, [alloc])


class StorePattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, store_op: Store, rewriter: PatternRewriter):
        sw = SWOp(store_op.value, store_op.memloc, 0)
        rewriter.replace_op(store_op, [sw])


class LoadPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, load_op: Load, rewriter: PatternRewriter):
        lw = LWOp(load_op.memloc, 0)
        rewriter.replace_op(load_op, [lw])


class UnaryExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, unary_op: UnaryExpr, rewriter: PatternRewriter):
        if unary_op.op.data == "-":
            zero = LIOp(0)
            neg = SubOp(zero, unary_op.value)
            rewriter.replace_op(unary_op, [zero, neg])
            return

        if unary_op.op.data == "not":
            neg = SLTIUOp(unary_op.value, 1)
            rewriter.replace_op(unary_op, [neg])
            return

        assert False, f"Cannot lower UnaryExpr {unary_op.op.data}"


class BinaryExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, bin_op: BinaryExpr, rewriter: PatternRewriter):
        if bin_op.op.data == "+":
            add = AddOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [add])
            return
        if bin_op.op.data == "*":
            prod = MULOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [prod])
            return
        if bin_op.op.data == "-":
            sub = SubOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [sub])
            return
        if bin_op.op.data == "//":
            zero = LIOp(0)
            jump_if_zero = BEQOp(bin_op.rhs.op, zero, "_error_div_zero")
            div = DIVOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [zero, jump_if_zero, div])
            return
        if bin_op.op.data == "%":
            rem = REMOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [rem])
            return
        if bin_op.op.data == "<":
            slt = SLTOp(bin_op.lhs, bin_op.rhs)
            rewriter.replace_op(bin_op, [slt])
            return
        if bin_op.op.data == ">":
            slt = SLTOp(bin_op.rhs, bin_op.lhs)
            rewriter.replace_op(bin_op, [slt])
            return
        if bin_op.op.data == "==" or bin_op.op.data == "is":
            xor = XOROp(bin_op.lhs, bin_op.rhs)
            one = LIOp(1)
            sltu = SLTUOp(xor, one)
            rewriter.replace_op(bin_op, [xor, one, sltu])
            return
        if bin_op.op.data == "!=":
            xor = XOROp(bin_op.lhs, bin_op.rhs)
            zero = LIOp(0)
            sltu = SLTUOp(zero, xor)
            rewriter.replace_op(bin_op, [xor, zero, sltu])
            return
        if bin_op.op.data == "<=":
            slt = SLTOp(bin_op.rhs, bin_op.lhs)
            one = LIOp(1)
            xor = XOROp(slt, one)
            rewriter.replace_op(bin_op, [slt, one, xor])
            return
        if bin_op.op.data == ">=":
            slt = SLTOp(bin_op.lhs, bin_op.rhs)
            one = LIOp(1)
            xor = XOROp(slt, one)
            rewriter.replace_op(bin_op, [slt, one, xor])
            return
        if bin_op.op.data == "and":
            zero = LIOp(0)
            sltu_lhs = SLTUOp(zero, bin_op.lhs)
            sltu_rhs = SLTUOp(zero, bin_op.rhs)
            and_ = ANDOp(sltu_lhs, sltu_rhs)
            rewriter.replace_op(bin_op, [zero, sltu_lhs, sltu_rhs, and_])
            return
        if bin_op.op.data == "or":
            zero = LIOp(0)
            sltu_lhs = SLTUOp(zero, bin_op.lhs)
            sltu_rhs = SLTUOp(zero, bin_op.rhs)
            or_ = OROp(sltu_lhs, sltu_rhs)
            rewriter.replace_op(bin_op, [zero, sltu_lhs, sltu_rhs, or_])
            return

        assert False, f"Cannot lower BinaryExpr {bin_op.op.data}"


class IfPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, if_op: If, rewriter: PatternRewriter):
        IfPattern.counter += 1

        c = IfPattern.counter

        zero = LIOp(0)
        rewriter.insert_op_before_matched_op(zero)
        branch = BEQOp(if_op.cond, zero, f"if_else_{c}")
        rewriter.insert_op_before_matched_op(branch)
        rewriter.insert_op_before_matched_op(LabelOp(f"if_then_{c}"))
        rewriter.inline_block_before_matched_op(if_op.then)
        jump = JOp(f"if_after_{c}")
        rewriter.insert_op_before_matched_op(jump)

        rewriter.insert_op_before_matched_op(LabelOp(f"if_else_{c}"))
        rewriter.inline_block_before_matched_op(if_op.orelse)
        rewriter.insert_op_before_matched_op(LabelOp(f"if_after_{c}"))

        rewriter.erase_matched_op()


class AndPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, and_op: EffectfulBinaryExpr, rewriter: PatternRewriter):
        if and_op.op.data != "and":
            return

        AndPattern.counter += 1
        c = AndPattern.counter

        # Result memory location
        res_loc = AllocOp()
        rewriter.insert_op_before_matched_op(res_loc)

        # Compute the left hand side of the expression
        lhs_val = and_op.lhs.ops.last.value
        rewriter.erase_op(and_op.lhs.ops.last)
        rewriter.inline_block_before_matched_op(and_op.lhs.blocks[0])

        # Store the result in the result memory location
        rewriter.insert_op_before_matched_op(SWOp(lhs_val, res_loc, 0))

        # If the result is 0, then jump to the end of the instruction
        zero = LIOp(0)
        rewriter.insert_op_before_matched_op(zero)
        branch = BEQOp(lhs_val, zero, f"and_after_{c}")
        rewriter.insert_op_before_matched_op(branch)

        # If the result is not 0, then execute the right hand side of the expression
        rhs_val = and_op.rhs.ops.last.value
        rewriter.erase_op(and_op.rhs.ops.last)
        rewriter.inline_block_before_matched_op(and_op.rhs.blocks[0])

        # Store the result in the result memory location
        rewriter.insert_op_before_matched_op(SWOp(rhs_val, res_loc, 0))

        rewriter.insert_op_before_matched_op(LabelOp(f"and_after_{c}"))

        # Get the operation result
        rewriter.replace_matched_op(LWOp(res_loc, 0))


class OrPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, or_op: EffectfulBinaryExpr, rewriter: PatternRewriter):
        if or_op.op.data != "or":
            return

        OrPattern.counter += 1
        c = OrPattern.counter

        # Result memory location
        res_loc = AllocOp()
        rewriter.insert_op_before_matched_op(res_loc)

        # Compute the left hand side of the expression
        lhs_val = or_op.lhs.ops.last.value
        rewriter.erase_op(or_op.lhs.ops.last)
        rewriter.inline_block_before_matched_op(or_op.lhs.blocks[0])

        # Store the result in the result memory location
        rewriter.insert_op_before_matched_op(SWOp(lhs_val, res_loc, 0))

        # If the result is not 0, then jump to the end of the instruction
        zero = LIOp(0)
        rewriter.insert_op_before_matched_op(zero)
        branch = BNEOp(lhs_val, zero, f"or_after_{c}")
        rewriter.insert_op_before_matched_op(branch)

        # If the result is not 0, then execute the right hand side of the expression
        rhs_val = or_op.rhs.ops.last.value
        rewriter.erase_op(or_op.rhs.ops.last)
        rewriter.inline_block_before_matched_op(or_op.rhs.blocks[0])

        # Store the result in the result memory location
        rewriter.insert_op_before_matched_op(SWOp(rhs_val, res_loc, 0))

        rewriter.insert_op_before_matched_op(LabelOp(f"or_after_{c}"))

        # Get the operation result
        rewriter.replace_matched_op(LWOp(res_loc, 0))


class IfExprPattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, if_op: IfExpr, rewriter: PatternRewriter):
        IfExprPattern.counter += 1

        c = IfExprPattern.counter

        zero = LIOp(0)
        rewriter.insert_op_before_matched_op(zero)
        alloc = AllocOp()
        rewriter.insert_op_before_matched_op(alloc)
        branch = BEQOp(if_op.cond, zero, f"if_expr_else_{c}")
        rewriter.insert_op_before_matched_op(branch)
        result = if_op.then_ssa_value
        rewriter.inline_block_before_matched_op(if_op.then)
        store_then = SWOp(result, alloc, 0)
        rewriter.insert_op_before_matched_op(store_then)
        rewriter.insert_op_before_matched_op(LabelOp(f"if_expr_then_{c}"))
        jump = JOp(f"if_expr_after_{c}")
        rewriter.insert_op_before_matched_op(jump)

        rewriter.insert_op_before_matched_op(LabelOp(f"if_expr_else_{c}"))
        result = if_op.or_else_ssa_value
        rewriter.inline_block_before_matched_op(if_op.or_else)
        store_or_else = SWOp(result, alloc, 0)
        rewriter.insert_op_before_matched_op(store_or_else)
        rewriter.insert_op_before_matched_op(LabelOp(f"if_expr_after_{c}"))

        load = LWOp(alloc, 0)
        rewriter.replace_op(if_op, [load])


class WhilePattern(RewritePattern):
    counter: int = 0

    @op_type_rewrite_pattern
    def match_and_rewrite(self, while_op: While, rewriter: PatternRewriter):
        WhilePattern.counter += 1

        c = WhilePattern.counter

        rewriter.insert_op_before_matched_op(LabelOp(f"while_head_{c}"))
        cond = while_op.cond_ssa_value
        rewriter.inline_block_before_matched_op(while_op.cond)

        zero = LIOp(0)
        branch = BEQOp(cond, zero, f"while_end_{c}")
        rewriter.insert_op_before_matched_op(zero)
        rewriter.insert_op_before_matched_op(branch)
        rewriter.inline_block_before_matched_op(while_op.body)
        jump = JOp(f"while_head_{c}")
        rewriter.insert_op_before_matched_op(jump)
        rewriter.insert_op_before_matched_op(LabelOp(f"while_end_{c}"))
        rewriter.erase_matched_op()
        return


class ListExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, list_expr: ListExpr, rewriter: PatternRewriter):
        size = LIOp(
            len(list_expr.elems) * 4 + 4, f"list_expr: the amount of bytes to allocate"
        )
        call = CallOp(
            "_malloc", [size], comment="list_expr: allocate memory for the list"
        )
        elements = LIOp(
            len(list_expr.elems), f"list_expr: the number of elements in the list"
        )
        store_elements = SWOp(
            elements,
            call,
            0,
            f"list_expr: store the number of elements at the beginning of the list",
        )
        new_ops = [size, call, elements, store_elements]
        ptr = call.results[0]

        i = 0
        for element in list_expr.elems:
            new_ops.append(
                SWOp(
                    element, ptr, 4 * (i + 1), f"list_expr: store element {i} into list"
                )
            )
            i += 1

        rewriter.replace_op(list_expr, new_ops, [ptr])


class GetAddressPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, get_address: GetAddress, rewriter: PatternRewriter):
        zero = LIOp(0)
        jump_if_none = BEQOp(get_address.value, zero, "_list_index_none")
        list_length = LWOp(get_address.value, 0)
        jump_if_oob = BGEUOp(get_address.index, list_length, "_list_index_oob")
        bytes_in_word = LIOp(4)
        mul = MULOp(get_address.index, bytes_in_word)
        address = AddOp(get_address.value, mul)
        address_plus_offset = AddIOp(address, 4)

        rewriter.replace_op(
            get_address,
            [
                zero,
                jump_if_none,
                list_length,
                jump_if_oob,
                bytes_in_word,
                mul,
                address,
                address_plus_offset,
            ],
        )


class IndexStringPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, indexString: IndexString, rewriter: PatternRewriter):
        zero = LIOp(0)
        jump_if_none = BEQOp(indexString.value, zero, "_list_index_none")
        list_length = LWOp(indexString.value, 0)
        jump_if_oob = BGEUOp(indexString.index, list_length, "_list_index_oob")
        bytes_in_word = LIOp(4)
        mul = MULOp(indexString.index, bytes_in_word)
        address = AddOp(indexString.value, mul)
        address_plus_offset = AddIOp(address, 4)

        char_content = LWOp(address_plus_offset, 0)

        malloc_size = LIOp(8)
        str_size = LIOp(1)
        malloc_call = CallOp(
            "_malloc",
            [malloc_size],
            comment="allocate memory for a string of single char",
        )
        sw_size = SWOp(str_size, malloc_call, 0)
        sw_char = SWOp(char_content, malloc_call, 4)

        res_loc = AllocOp()
        sw_res = SWOp(malloc_call, res_loc, 0)

        rewriter.insert_op_before_matched_op(
            [
                zero,
                jump_if_none,
                list_length,
                jump_if_oob,
                bytes_in_word,
                mul,
                address,
                address_plus_offset,
                char_content,
                malloc_size,
                str_size,
                malloc_call,
                sw_size,
                sw_char,
            ]
        )
        rewriter.insert_op_after_matched_op([sw_res])
        rewriter.replace_matched_op(res_loc)


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
        new_return = ReturnOp([ret.value])
        rewriter.replace_op(ret, [new_return])


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
