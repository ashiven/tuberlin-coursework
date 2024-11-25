#!/bin/bash

# Check if sysbench is installed; install if not (suppress output)
if ! command -v sysbench > /dev/null 2>&1; then
    DEBIAN_FRONTEND=noninteractive apt update -qq > /dev/null 2>&1
    DEBIAN_FRONTEND=noninteractive apt install -y sysbench -qq > /dev/null 2>&1
fi

benchmark_time="1"

# Get the current timestamp
timestamp=$(date +%s)

# Run the CPU benchmark test
cpu_result=$(sysbench cpu --time=$benchmark_time run | grep "events per second" | awk '{print $4}')

# Run the memory benchmark test with a block size of 4KB and a total size of 100TB
memory_result=$(sysbench memory --time=$benchmark_time --memory-block-size=4K --memory-total-size=100T run | grep "transferred" | awk '{print $4}' | tr -d '(')

# Run the random disk read benchmark test
sysbench fileio --file-total-size=1G --file-test-mode=rndrd prepare > /dev/null 2>&1
random_disk_result=$(sysbench fileio --time=$benchmark_time --file-total-size=1G --file-test-mode=rndrd run | grep "reads/s:" | awk '{print $2}')
sysbench fileio --file-total-size=1G --file-test-mode=rndrd cleanup > /dev/null 2>&1

# Run the sequential disk read benchmark test
sysbench fileio --file-total-size=1G --file-test-mode=seqrd prepare > /dev/null 2>&1
sequential_disk_result=$(sysbench fileio --time=$benchmark_time --file-total-size=1G --file-test-mode=seqrd run | grep "reads/s:" | awk '{print $2}')
sysbench fileio --file-total-size=1G --file-test-mode=seqrd cleanup > /dev/null 2>&1

# Format the test results as a CSV line and output it
echo "$timestamp,$cpu_result,$memory_result,$random_disk_result,$sequential_disk_result"
