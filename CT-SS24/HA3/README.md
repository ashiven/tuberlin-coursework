# CT 2023/24 | Coursework 3 - Code Generation

**Deadline:** Monday, 01.07.2024, midnight
**Instructors:** Michel Steuwer
**TAs:** Nicole Heiniman and Rudi Schneider

## Provided

This coursework already provides:

- I) Lowering from the choco AST (`choco.ast`) to a flat version of the choco AST (`choco.ir`).
- II) A skeleton for lowering the `choco.ir` to an SSA RISCV-V dialect (`riscv_ssa`) - **you must complete this in this course work**.
- III) Lowering from `riscv_ssa` to a dialect for RISC-V assembly (`riscv`).
- IV) A printer for the `riscv` dialect which emits assembly files.


## Task: Code generation


## Quick Install (for DICE-like environments)

### Download This Coursework

First, you will need to **clone** the repository from GitLab.

  At this point, you can clone the repository:
  - if you used HTTPS above, use the command
    ```
    git clone https://git.tu-berlin.de/compiling-techniques/2024/USER_NAME/REPOSITORY_NAME.git
    ```
  - if you used SSH, use the command
    ```
    git clone git@git.tu-berlin.de:compiling-techniques/2024/USER_NAME/REPOSITORY_NAME.git
    ```
Now enter the repository directory: `cd REPOSITORY_NAME`. If this is your first time using Git, you will need to set up a bit of configuration:
  ```
  git config --global user.name "your_github_username"
  git config --global user.email "your_github_email"
  ```
  This will set your username and email globally (for all repositories, unless they overwrite this), so all future GitHub repositories will already have this set up. If you do not wish to do that, just omit the `--global`.
  You can verify the setup using `git config -l`, which will just tell you what settings you set.

### Installation

You need a modern version of Python for the coursework.
We have tested this setup with Python 3.12.

You can either follow the instructions below for the command line *or* PyCharm.

#### Command Line

We recommend that you create an isolated python environment using [venv](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/#creating-a-virtual-environment).  
To set up `venv` for the assignment, follow the steps below:

1. Set up a virtual environment.
   This creates a subdirectory called `env` in the current folder that creates an isolated version of Python.
    ```bash
    /path/to/coursework$ python3 -m venv env # set up virtual environment called `env`
    ```
2. Activate the virtual environment by [`source`ing](https://linuxcommand.org/lc3_man_pages/sourceh.html) the activation file (you have to do this for every new terminal window):
   ```bash
    /path/to/coursework$ source env/bin/activate
   ```
3. Confirm that you are in the virtual environment:
   ```bash
   /path/to/coursework$ which python # confirm python path
   /path/to/coursework/env/bin/python
   ```
4. Install dependencies within the virtual environment:
   ```bash
   /path/to/coursework$ pip install --upgrade pip # upgrade pip
   /path/to/coursework$ pip install -U -r requirements.txt # install dependencies
   ```
5. Install the ChocoPy compiler as a package:
   ```bash
   /path/to/coursework$ pip install -e . # install ChocoPy as a package
   ```

#### PyCharm

It would be convenient for you, if you used a modern IDE for Python.
A popular choice, is [PyCharm](https://www.jetbrains.com/pycharm/).

If you decide to use `PyCharm`, download and install it on your computer. Then:

1) Open the repository folder in `PyCharm`
2) Configure a virtual Python environment as described in the manual: https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html
2) Install the dependencies by opening the embedded terminal (`Alt+F12` by default) and run:
   ```bash
   pip install --upgrade pip # upgrade pip
   pip install -U -r requirements.txt # install dependencies
   ```
3) Install the ChocoPy compiler as a package:
   ```bash
   pip install -e . # install ChocoPy as a package
   ```

### Test your solutions

You can use `lit` to automatically test your code, which is include in the `requirements.txt`.

To run it locally, do:

```bash
lit -v tests/end-to-end
```

This will examine recursively all the files with valid formats inside the above directory.
The `-v` flag adds a verbose output with more information in case some tests fail.
You can also leverage the `--timeout <seconds>` flag, in order to bound the time allowed for your test cases to run.
This way you can detect if your parser loops infinitely in some test cases.

For more details on the configuration of `lit`, see `tests/lit.cfg`.
For more info on `lit` check the [online documentation](https://filecheck.readthedocs.io/en/latest/01-what-is-filecheck.html).

## Task - Code Generation

The goal of this course work is to write a code generator for the [ChocoPy Language](https://chocopy.org), targeting the [RISC-V architecture](https://riscv.org/).
The output RISC-V program will be run on a [RISC-V interpreter](https://github.com/antonlydike/riscemu) that supports the RISC-V base integer instruction set as well as the multiplication and division extensions, so you can use directly multiplication and division instructions.

In particular, you need to implement the lowering from the `choco.ir` dialect to the `riscv_ssa` dialect.
The template already provides a partial implementation of the lowering.
You will have to implement the rest.

### 1. Getting Started
**First read this README completely and carefully!**
It explains the lowering phases of the code generation, as well as how to run the assembly code.
We have also added some [hints](#6-Hints) that are useful for this coursework.

To understand how lowering from `choco.ast` to `choco.ir` works (step I), have a look at `choco/choco_ast_to_choco_flat.py`.
After you have a quick look, it would be particularly useful for understanding the next steps, if you get a good understanding of the following files:

* `choco/choco_flat_introduce_library_calls.py`
* `choco/for_to_while.py`

The `choco.ir` dialect is described in `choco/dialects/choco_flat.py`.

### 2. RISC-V SSA Dialect

To understand how you should lower `choco.ir` to `riscv_ssa` (step II), you need look at what RISC-V instructions are available in the class `RISCVSSA` of `riscv/ssa_dialect.py`.

Our classes directly map to the corresponding RISC-V instructions and pseudo-instructions.
For example, `LIOp` class maps to `li`, and any operation `riscv_ssa.<NAME>` will map to the `<NAME>Op` instruction.
Here, `li` is the pseudo-instruction that loads the 32-bits constant to the given register.

Each instruction subclasses a RISC-V Operation, e.g., `Riscv1Rd1Rs1ImmOperation`, which tells you how to use this particular instruction.
For example, the aforementioned operation uses one destination register (`Rd`), one source register (`Rs`) and one immediate (`Imm`).
A RISC-V instruction that corresponds to this encoding is `AddIOp`, which adds an immediate to the source register, and places the result on the destination register.

### 3. Runtime Library

We give you the implementation of the runtime library, which is automatically added to your riscv programs. Some of the library function calls are already generated by the frontend, but you will need to generate some calls for these functions:
* `_malloc`: Allocate in the heap the number of bytes given as argument, and return a pointer to it (assume you will always have enough space to allocate memory).
* `_error_len_none`: Print an error and exit the program. This should be used when `len` is called on a `None` value.
* `_list_index_oob`: Print an error and exit the program. This should be used when an array is accessed out of bounds.
* `_list_index_none`: Print an error and exit the program. This should be used when `None` is indexed.

### 4. Rewriter API

In order to transform the IRs, you will need to use the xDSL rewriter engine.
Here is for instance the given skeleton for the `UnaryExpr` rewrite pattern:
```
class UnaryExprPattern(RewritePattern):
    @op_type_rewrite_pattern
    def match_and_rewrite(self, unary_op: UnaryExpr, rewriter: PatternRewriter):
        raise NotImplementedError()
```

The `match_and_rewrite` method will be called for each `UnaryExpr` in the IR.
The `rewriter` argument has multiple methods that you will need to use throughout the coursework:
* `insert_op_before_matched_op`: Inserts new operations given as inputs before the matched operation (`unary_op` here).
* `erase_matched_op`: Erase the matched operation. If the matched operation had results that are still used, this will trigger an error.
* `erase_op`: Erase the given operation. The given operation should either be the matched
  operation, or an operation contained in the matched operation's regions and blocks. If the
  given operation had results that are still used, this will trigger an error.
* `replace_matched_op`: Replace the matched operation with new operations given as input. The
  SSA results of the matched operation will be replaced by the SSA results of the last given
  operation. Optionally, you can provide a list of SSA values to replace the results of the
  matched operation.
* `inline_block_before_matched_op`: Move the operations in a block right before the matched operation. Several expressions have blocks
  inside them that you don't want to delete (e.g. while loops). You can use this function to take those blocks out of the expression,
  basically "rescuing" them before the parent expression gets deleted while converting it to RISCV.

Note that `insert_op_before_matched_op` and `inline_block_before_matched_op` should not be used after `replace_matched_op` or `erase_matched_op`.

### 5. Coding

To get started coding look at the file `choco/choco_flat_to_riscv_ssa.py` which contains an incomplete implementation of the lowering to `riscv_ssa`.

The file contains:

- An example rewrite pattern for call expressions.
- A utility function to call the rewriters that lower `choco.ir` to `riscv_ssa`.

**You will need to complete the implementations of the other rewrite patterns**.


#### We suggest the following order when implementing the rewrite patterns:

1. Literals (except strings)
2. Unary expressions (arithmetic and logical)
3. Arithmetic binary expressions
4. Assign statements (alloca, load, store)
5. If statements
6. Logical and conditional expressions
7. While statements
8. List expressions
9. Index operation
10. String literals and string operations

The `tests/end-to-end` folder contains a directory for each section,
making it easier to check your progress.

Now, you can actually execute a ChocoPy program!
First, you can get the RISC-V assembly, by doing:

```bash
cd /path/to/coursework
choco-opt -p all -t riscv tests/end-to-end/print-integer-literal.choc
```

Second, you can run the RISC-V assembly, using the `riscv-interpreter` tool:

```bash
riscv-interpreter tests/riscv/interpreter/hello_world.s
```

Finally, you can combine the above tools in order to execute directly a ChocoPy program:

```bash
cd /path/to/coursework
choco-opt -p all -t riscv tests/end-to-end/print-integer-literal.choc >temp.s && riscv-interpreter temp.s
```

Also, take a look at how `lit` will run tests with filecheck, examining the first line of, e.g., `tests/end-to-end/print-integer-literal.choc`.

### 6. Simplifications

In your implementation, values will all be unboxed, meaning that they do not carry type information.
However, with unboxed, it is not possible to use any value of type `object`, since we
cannot recover its original type statically. To simplify your implementation, we will thus not test
any code that has `object` values, or heterogeneous lists. In particular, this include expressions
such as `if True then 2 else "foo"`, or `[0, True]`.

Similarly, we only support `print` with a `bool`, `int`, or `str` input.
Values of int and bool types are stored as words (4 bytes).
Lists and strings have also elements of 4 bytes each.
All integers are signed.
Finally, negative indexing is not allowed.

### 7. Hints

#### Alloca, Load, Store

Initially, you can check the correct implementation of `Alloca`, `Store` and `Load`, using the test cases inside `end-to-end/var-defs`.
`Alloca` and `Store` are necessary for variable definitions, `Store` is also necessary for assignments, and `Load` is necessary whenever you are accessing a variable.
`Alloca` essentially allocates a space of 4 bytes on the stack and returns a pointer to the allocated memory.

#### and, or, and if/else expressions

The `and`, `or`, and `if/else` expressions use short-circuit evaluation. This
means that in the case of an `and` for instance, `False and foo()` will not lead
to the execution of `foo`, since `and` will return `False` for any value
returned by `foo`. This is important in the case where `foo` has a side-effect.

`and`, `or`, and `if/else` expressions use regions to separate both "branches".
Since both branches can have SSA variables, the "result" of a branch is given by
the `yield` operation. Here is for instance the code for `0 > 1 or 1 >= 2`:

```
builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.effectful_binary_expr"() <{"op" = "or"}> ({
      %1 = "choco.ir.literal"() <{"value" = 0 : i32}> : () -> !choco.ir.named_type<"int">
      %2 = "choco.ir.literal"() <{"value" = 1 : i32}> : () -> !choco.ir.named_type<"int">
      %3 = "choco.ir.binary_expr"(%1, %2) <{"op" = ">"}> : (!choco.ir.named_type<"int">, !choco.ir.named_type<"int">) -> !choco.ir.named_type<"bool">
      "choco.ir.yield"(%3) : (!choco.ir.named_type<"bool">) -> ()
    }, {
      %4 = "choco.ir.literal"() <{"value" = 1 : i32}> : () -> !choco.ir.named_type<"int">
      %5 = "choco.ir.literal"() <{"value" = 2 : i32}> : () -> !choco.ir.named_type<"int">
      %6 = "choco.ir.binary_expr"(%4, %5) <{"op" = ">="}> : (!choco.ir.named_type<"int">, !choco.ir.named_type<"int">) -> !choco.ir.named_type<"bool">
      "choco.ir.yield"(%6) : (!choco.ir.named_type<"bool">) -> ()
    }) : () -> !choco.ir.named_type<"bool">
  }) : () -> ()
}
```

When you want to get the result of an operation from a region, it should always be from a `Yield` operation, which is at the end of the operation containing the region.
You can get the first operation from a `Block` using `.first`, and similarly for the last operation.

Finally, note the `choco.ir.effectful_binary_expr()` operator, denoting that this is not just a binary expression (like an addition).

#### If Statement

Things will start to become more difficult with control flow.
Essentially, control flow constructs will be needed for if-else statements, while statements, but also for the logical binary expressions (`and`/`or`) and the conditional expression.

Assume the following program:

```python
if True:
  42
else:
  17
```

You can see what is the `choco.ir` form of this program by running:

```
$ choco-opt -p check-assign-target,name-analysis,type-checking,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,for-to-while /path/to/program

builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = #choco.ir.bool<True>}> : () -> !choco.ir.named_type<"bool">
    "choco.ir.if"(%0) ({
      %1 = "choco.ir.literal"() <{"value" = 42 : i32}> : () -> !choco.ir.named_type<"int">
    }, {
      %2 = "choco.ir.literal"() <{"value" = 17 : i32}> : () -> !choco.ir.named_type<"int">
    }) : (!choco.ir.named_type<"bool">) -> ()
  }) : () -> ()
}
```

Notice the SSA values created for the condition (`%0`), the value in the if-then block (`%1`), and the value in the if-else block (`%2`).

We sketch how you should approach control flow, when lowering from `choco.ir` to `riscv_ssa`:

1. Assuming that you evaluate conditions by comparing them with zero, you need an SSA value for the constant `0`.
2. You need a RISC-V branch instruction to compare your condition with zero.
3. Since we have control flow, you need labels to represent locations in code, i.e., where is the code for the if-then block, for the if-else block, and for the code after the if statement.
4. If your condition evaluates to false, then you need to jump to the if-else label.
5. Otherwise, you continue with the if-then block, but you also need an extra instruction to jump to the code after the if statement.

The correct `riscv_ssa` output would be:

```
$ choco-opt -p check-assign-target,name-analysis,type-checking,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,for-to-while,choco-flat-to-riscv-ssa /path/to/program

builtin.module {
  "riscv_ssa.func"() <{"func_name" = "_main"}> ({
    %0 = "riscv_ssa.li"() <{"immediate" = 1 : i32}> : () -> !riscv_ssa.reg
    %1 = "riscv_ssa.li"() <{"immediate" = 0 : i32}> : () -> !riscv_ssa.reg
    "riscv_ssa.beq"(%0, %1) <{"offset" = #riscv.label<if_else_1>}> : (!riscv_ssa.reg, !riscv_ssa.reg) -> ()
    "riscv_ssa.label"() <{"label" = #riscv.label<if_then_1>}> : () -> ()
    %2 = "riscv_ssa.li"() <{"immediate" = 42 : i32}> : () -> !riscv_ssa.reg
    "riscv_ssa.j"() <{"offset" = #riscv.label<if_after_1>}> : () -> ()
    "riscv_ssa.label"() <{"label" = #riscv.label<if_else_1>}> : () -> ()
    %3 = "riscv_ssa.li"() <{"immediate" = 17 : i32}> : () -> !riscv_ssa.reg
    "riscv_ssa.label"() <{"label" = #riscv.label<if_after_1>}> : () -> ()
  }) : () -> ()
}
```

There are many things to notice here.

* `%0` is the SSA value of `True` in the condition.
* `%1` is the SSA value of zero.
* `riscv_ssa.beq` compares the condition with zero. If the condition evaluates to zero (i.e., false), we jump to the `if_else_1` label.
* Otherwise, we continue to the if-then block (`if_then_1` label).
* `%2` is the only thing inside the if-then block.
* `riscv_ssa.j` jumps over the if-else block to the code after if (`if_after_1` label).
* `%3` is the only thing inside the if-else block.

In order to generate branch instructions in the `riscv_ssa` dialect, you can choose one of the `BEQOp`, `BNEOp`, etc.
See the `ricsv/ssa_dialect` for more details.

These instructions are of `Riscv2Rs1OffOperation` type, which means that they take two SSA values and one offset as an argument.
The offset should be a string representing the label name to which you are branching.

A final thing to keep in mind is that each label name should be unique.
If you use for the `if_then_label` variable the string `"if_then"`, and your program contains multiple if statements,
you will end up with identical label names (which is wrong).

Use the counters provided in the rewrite patterns to get unique names for your labels.

#### Strings

As mentioned in the lectures, strings (which are treated like lists) should have a first element for their size, and then 4 bytes per character.

### Useful choco-opt shortcuts

Here are some available shortcuts you can call from `choco-opt`:
- `choco-opt -p type [filename.choc]` gives the type checking output (`check-assign-target,name-analysis,type-checking`);
- `choco-opt -p ir [filename.choc]` gives the original ir output - a flattened choco AST  (`check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat`);
- `choco-opt -p fold [filename.choc]` gives the output after constant folding  (`check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,choco-flat-constant-folding`);
- `choco-opt -p iropt [filename.choc]` gives the optimized ir ready for instruction selection to riscv_ssa  (`check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,choco-flat-constant-folding,choco-flat-dead-code-elimination,for-to-while`);
- `choco-opt -p riscv [filename.choc]` gives the riscv_ssa output assuming optimized ir as input (`check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,choco-flat-constant-folding,choco-flat-dead-code-elimination,for-to-while,choco-flat-to-riscv-ssa`);
- `choco-opt -p all [filename.choc]` gives the output after all the passes  (`check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,choco-flat-constant-folding,choco-flat-dead-code-elimination,for-to-while,choco-flat-to-riscv-ssa,riscv-ssa-to-riscv,riscv-function-lowering`)

You can also explicitly write the passes you need if these shortcuts don't cover a particular scenario you are testing.

If you want to see the difference introduced by each pass, you can add the `--print-between-passes` flag in `choco-opt`.

You can check `tools/choco-opt.py` and `choco-opt -h` for more information.


## Implementation guidelines

### Questions
Follow our academic guidelines and take advantage of the Forum on ISIS to discuss any open questions.

For the following courseworks, the full lexer and parser will be provided.

If you have questions, you should consult the lecture slides and recordings. If you have questions about the coursework, please start by **checking existing discussions on the ISIS Forum**. If you can't find the answer to your question, start a new discussion. It is quite possible that other students will have encountered and solved the same problem and will be able to help you.

### Submissions are INDIVIDUAL
Submitted code will be checked for similarity with other submissions using the MOSS system. MOSS has been effective in the past at finding similarities and it is not fooled by name changes or reordering of code blocks. Courseworks are INDIVIDUAL, and we expect everyone to turn in their sole, independent work.

###  Commit and push your changes to GitLab

You are encouraged to commit your changes regularly.
This allows you to track the history of your changes so that you can revert to an earlier version of your code if you need to.
It also protects you from losing any of your work in the case of a computer failure.