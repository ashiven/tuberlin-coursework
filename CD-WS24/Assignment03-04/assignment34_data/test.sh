#! /usr/bin/env bash

set -euo pipefail

# build the shared library if the -s flag is not set
if [ $# -eq 0 ]; then
    make clean
    make
fi

# move into test directory
cd ../tests

# iterate over all 10 test files to compile them to llvm ir and then test them using the passes
for i in {1..10}; do
    echo "Running test$i ..."
    clang -c -S -emit-llvm -fno-discard-value-names test"$i".c

    # run the def-pass and sort the output alphabetically
    opt -load-pass-plugin ../assignment34_data/p34.so --passes=def-pass test"$i".ll -o test"$i".bc 2>test"$i".my_def
    sort -o "test$i.my_def" "test$i.my_def"

    # run the fix-pass
    opt -load-pass-plugin ../assignment34_data/p34.so --passes=fix-pass test"$i".ll -o test"$i"_fix.bc
    lli test"$i"_fix.bc >test"$i".my_out

    # compare the outputs of the passes with the expected outputs
    diff --color -b -c -s "test$i.my_def" "test$i.def"
    diff --color -b -c -s "test$i.my_out" "test$i.out"
done
