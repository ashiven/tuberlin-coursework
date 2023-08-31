#!/usr/bin/env bash

set -euo pipefail

PROGRAM="tmux"

if ! command -v ${PROGRAM} >/dev/null; then
  echo "This script requires ${PROGRAM} to be installed and on your PATH ..."
  exit 1
fi

IP=127.0.0.1

#ID0=512
ID1=1024
ID2=2048
ID3=4096

PORT0=4000
PORT1=4001
PORT2=4002
PORT3=4003

tmux new -s peers -d
tmux send-keys -t peers "./build/peer $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "sleep 1 && ./build/peer $IP $PORT1 $ID1 $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "sleep 2 && ./build/peer $IP $PORT2 $ID2 $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "sleep 3 && ./build/peer $IP $PORT3 $ID3 $IP $PORT0" C-m
tmux split-window -h -t peers
tmux send-keys "sleep 8 && echo 'You have invited all my friends!' | ./build/client $IP $PORT0 SET Good Thinking! && sleep 2 && ./build/client $IP $PORT3 GET Good Thinking!" C-m
tmux select-layout tiled
tmux attach -t peers