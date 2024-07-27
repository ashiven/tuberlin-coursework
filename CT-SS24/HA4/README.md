# CT 2023/24 | Coursework 4 - Optimization

**Deadline:** Monday, 29.07.2024, midnight
**Instructors:** Michel Steuwer
**TAs:** Nicole Heiniman and Rudi Schneider

## Provided

This coursework already provides a fully working compiler producing RISCV assembly code for ChocoPy programs.


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

## Task - Code Optimization

The goal of this task is to optimize the code in terms of code size, that is to reduce the generated lines of RISC-V assembly.

The provided compiler contains only a very basic register allocator that spills for every instruction.
Improving the register allocator is one of the best ways to reduce the number of instructions.
We give examples of different possible further ways to reduce the number of instructions below.

### Getting Started

For this task, you can modify or add any pass you want, at any level (dialect) of the compilation pipeline.
We only ask you to not modify nor remove the library calls, nor change the command line API.
Be careful that your optimizations are correct, because otherwise you might lose points as well!

The files in `tests/end-to-end/code-size-optimization` contain examples that have some optimization opportunities.
We recommend you to implement these optimizations (in order of difficulty):
* Constant folding (you can continue the implementation of `choco/constant_folding.py`)
* Some arithmetic simplification rewrite rules (such as `x * 0 = 0`, or `(x + 3) + 5 = x + 8`)
* Removal of unnecessary `load`/`store` for temporary chocopy variables.
* Improving the register allocator to not always spill registers on the stack.
  This can be done in a pass after the translation of riscv-ssa to riscv, or by modifying
  the register allocator (hard, but would yield significantly better code).

Generally, as long as the output of your program will stay the same for all inputs, it is safe to perform an optimization.

We include two minimal examples of rewriters, which operate on the `choco.ir` level.
So, you should start by establishing a good understanding of the following files:

* `choco/constant_folding.py`
* `choco/dead_code_elimination.py`

### Adding a new pass to `choco-opt`

To add a new pass, we take as similar approach as in `choco/constant_folding.py`.

First, you need to create a similar file, e.g., `choco/your_new_pass.py`.

Then, this file can contain your rewriter pattern and a `ModulePass` with an `apply` function that will invoke the `PatternRewriteWalker` with your rewriter.
For example, this function could be called `ChocoFlatYourNewPass`, assuming that your new pass operates on `choco.ir` (choco flat).

Finally, you need to import this invocation function from `choco-opt`, by including:

```python
from choco.your_new_pass import ChocoFlatYourNewPass
```

and, also, you need to add the function into the `passes_native` list:

```python
    passes_native = [
        # Semantic Analysis
        CheckAssignTargetPass,
        # ...

        # IR Optimization
        # ...
        ChocoFlatYourNewPass,

        # Code Generation
        # ...
    ]

```



Adding a new separate pass could help with development and debugging, as you can include only some of your passes in `choco-opt` invocation and see if one of them is causing an error.

Instead of passing `-p all` to `choco-opt`, you can be explicit about the passes:


```bash
cd /path/to/coursework
choco-opt -p check-assign-target,name-analysis,type-checking,warn-dead-code,choco-ast-to-choco-flat,choco-flat-introduce-library-calls,choco-flat-constant-folding,choco-flat-dead-code-elimination,for-to-while,choco-flat-to-riscv-ssa,riscv-ssa-to-riscv,riscv-function-lowering -t riscv tests/end-to-end/print-integer-literal.choc
```

Notice the `choco-flat-constant-folding` and `choco-flat-dead-code-elimination` passes.
You could remove or add more passes likewise.

### Examples

#### Dead code elimination in the `choco.ir`:

The code:
```
builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 42 : i32}> : () -> !choco.ir.named_type<"int">
    %1 = "choco.ir.literal"() <{"value" = 8 : i32}> : () -> !choco.ir.named_type<"int">
    "choco.ir.call_expr"(%1) <{"func_name" = "_print_int"}> : (!choco.ir.named_type<"int">) -> ()
  }) : () -> ()
}
```
can be legally converted to:
```
builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 8 : i32}> : () -> !choco.ir.named_type<"int">
    "choco.ir.call_expr"(%0) <{"func_name" = "_print_int"}> : (!choco.ir.named_type<"int">) -> ()
  }) : () -> ()
}
```
where the original SSA value `%0` was removed since it was not used later (note that the SSA values were renumbered again).

#### Constant propagation and dead code elimination in the `choco.ir`:

The code:
```
builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 42 : i32}> : () -> !choco.ir.named_type<"int">
    %1 = "choco.ir.literal"() <{"value" = 8 : i32}> : () -> !choco.ir.named_type<"int">
    %2 = "choco.ir.binary_expr"(%0, %1) <{"op" = "+"}> : (!choco.ir.named_type<"int">, !choco.ir.named_type<"int">) -> !choco.ir.named_type<"int">
    "choco.ir.call_expr"(%2) <{"func_name" = "_print_int"}> : (!choco.ir.named_type<"int">) -> ()
  }
}
```

can be legally converted to:

```
builtin.module {
  "choco.ir.func_def"() <{"func_name" = "_main", "return_type" = !choco.ir.named_type<"<None>">}> ({
    %0 = "choco.ir.literal"() <{"value" = 50 : i32}> : () -> !choco.ir.named_type<"int">
    "choco.ir.call_expr"(%0) <{"func_name" = "_print_int"}> : (!choco.ir.named_type<"int">) -> ()
  }
}
```

where the binary expression was replaced by the sum of the constants,
and the other two SSA values were eliminated as dead.
The dead code elimination was enabled by the constant propagation.


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