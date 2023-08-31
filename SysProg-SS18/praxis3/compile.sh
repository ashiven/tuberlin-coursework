#!/usr/bin/env bash

# Compiles all .c Files, which are in this directory and in the Task and Scheduling directory, so
# there is no reason to edit it!
gcc -std=gnu99 ./*.c ./Scheduling/*.c ./Tasks/*.c -pthread -lm -o scheduler

# alternative to remove fancy colors and to add a speedup to the execution
# gcc -D NO_FANCY ./*.c ./Scheduling/*.c ./Tasks/*.c -pthread -lm -o scheduler
