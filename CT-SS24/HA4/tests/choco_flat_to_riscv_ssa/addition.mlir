// RUN: choco-opt -p "choco-flat-to-riscv-ssa" %s | filecheck %s

//
// 42 + 43
//

builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 42 : i32}> : () -> !choco.ir.named_type<"int">
    %1 = "choco.ir.literal"() <{"value" = 43 : i32}> : () -> !choco.ir.named_type<"int">
    %2 = "choco.ir.binary_expr"(%0, %1) <{"op" = "+"}> : (!choco.ir.named_type<"int">, !choco.ir.named_type<"int">) -> !choco.ir.named_type<"int">
  }) : () -> ()
}

// CHECK:       builtin.module {
// CHECK-NEXT:    "riscv_ssa.func"() <{"func_name" = "_main"}> ({
// CHECK-NEXT:      %0 = "riscv_ssa.li"() <{"immediate" = 42 : i32}> : () -> !riscv_ssa.reg
// CHECK-NEXT:      %1 = "riscv_ssa.li"() <{"immediate" = 43 : i32}> : () -> !riscv_ssa.reg
// CHECK-NEXT:      %2 = "riscv_ssa.add"(%0, %1) : (!riscv_ssa.reg, !riscv_ssa.reg) -> !riscv_ssa.reg
// CHECK-NEXT:    }) : () -> ()
// CHECK-NEXT:  }
