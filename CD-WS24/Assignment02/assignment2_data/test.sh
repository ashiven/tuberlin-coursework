#! /usr/bin/env bash

# compile the parser
make clean
make parser

# give the user an option to specify up until which test case to run
if [ $# -eq 0 ]; then
    echo -e "\nNo arguments provided, running all test cases"
    end=9
else
    echo -e "\nRunning test cases up until test case $1"
    end=$1
fi

# execute every test case and compare stdout and stderr with expected outputs
i=0
while [ "$i" -le "$end" ]; do
    echo -e "\nTest case $i"
    ./parser.exe "../tests/test$i.rtsl" >"../tests/test$i.my_out" 2>"../tests/test$i.my_err"
    diff --color -b -c -s "../tests/test$i.my_out" "../tests/test$i.out"
    diff --color -b -c -s "../tests/test$i.my_err" "../tests/test$i.err"
    ((i++))
done
