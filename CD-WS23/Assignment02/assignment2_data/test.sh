#! /usr/bin/env bash

# compile the parser
make clean
make parser

# give the user an option to specify up until which test case to run
if [ $# -eq 0 ]; then
    echo -e "\nNo arguments provided, running all test cases"
    end=9
    additional=true
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

# if the user did not specify a number of test cases, run the additional test cases
if [ "$additional" = true ]; then
    echo -e "\nTest case dielectric_material"
    ./parser.exe "../tests/dielectric_material.rtsl" >"../tests/dielectric_material.my_out" 2>"../tests/dielectric_material.my_err"
    diff --color -b -c -s "../tests/dielectric_material.my_out" "../tests/dielectric_material.out"
    diff --color -b -c -s "../tests/dielectric_material.my_err" "../tests/dielectric_material.err"

    echo -e "\nTest case pinhole_camera"
    ./parser.exe "../tests/pinhole_camera.rtsl" >"../tests/pinhole_camera.my_out" 2>"../tests/pinhole_camera.my_err"
    diff --color -b -c -s "../tests/pinhole_camera.my_out" "../tests/pinhole_camera.out"
    diff --color -b -c -s "../tests/pinhole_camera.my_err" "../tests/pinhole_camera.err"

    echo -e "\nTest case sphere"
    ./parser.exe "../tests/sphere.rtsl" >"../tests/sphere.my_out" 2>"../tests/sphere.my_err"
    diff --color -b -c -s "../tests/sphere.my_out" "../tests/sphere.out"
    diff --color -b -c -s "../tests/sphere.my_err" "../tests/sphere.err"
fi
