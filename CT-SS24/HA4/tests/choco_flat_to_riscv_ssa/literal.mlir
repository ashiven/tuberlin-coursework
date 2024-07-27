// RUN: choco-opt -p "choco-flat-to-riscv-ssa" %s | filecheck %s

//
// 42
//

builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 42 : i32}> : () -> !choco.ir.named_type<"int">
  }) : () -> ()
}

// CHECK:       builtin.module {
// CHECK-NEXT:    "riscv_ssa.func"() <{"func_name" = "_main"}> ({
// CHECK-NEXT:      %0 = "riscv_ssa.li"() <{"immediate" = 42 : i32}> : () -> !riscv_ssa.reg
// CHECK-NEXT:    }) : () -> ()
// CHECK-NEXT:  }
