#!/usr/bin/env bash

set -euo pipefail

PROGRAM="tmux"

if ! command -v ${PROGRAM} >/dev/null; then
  echo "This script requires ${PROGRAM} to be installed and on your PATH ..."
  exit 1
fi

IP=127.0.0.1

ID0=138
ID1=202
ID2=150
ID3=74
ID4=50
ID5=400
ID6=10

PORT0=4710
PORT1=4711
PORT2=4712
PORT3=4713
PORT4=4714
PORT5=4715
PORT6=4716

tmux new -s peers -d
tmux send-keys -t peers "./build/peer $IP $PORT0 $ID0" C-m
tmux split-window -h -t peers
tmux send-keys "./build/peer $IP $PORT1 $ID1 $IP $PORT0" C-m
tmux select-pane -t :.+
tmux split-window -v -t peers

tmux send-keys "./build/peer $IP $PORT2 $ID2 $IP $PORT0" C-m
tmux select-pane -t :.+
tmux split-window -v -t peers
tmux send-keys "./build/peer $IP $PORT3 $ID3 $IP $PORT0" C-m
tmux split-window -h -t peers

tmux send-keys "./build/peer $IP $PORT4 $ID4 $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "./build/peer $IP $PORT5 $ID5 $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "./build/peer $IP $PORT6 $ID6 $IP $PORT0" C-m
tmux split-window -h -t peers

tmux send-keys "sleep 10 && ./build/client $IP $PORT0 FINGER /cat.txt" C-m #/cat.txt bleibt da 5 args benoetigt fuer client
tmux send-keys "sleep 5 && echo 'Hello World' | ./build/client $IP $PORT0 SET /cat.txt && sleep 1 && ./build/client $IP $PORT1 GET /cat.txt" C-m
tmux select-layout tiled
tmux attach -t peers
