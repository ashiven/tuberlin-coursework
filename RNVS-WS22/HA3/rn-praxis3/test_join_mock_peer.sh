#!/usr/bin/env bash

set -euo pipefail

PROGRAM="tmux"

if ! command -v ${PROGRAM} >/dev/null; then
  echo "This script requires ${PROGRAM} to be installed and on your PATH ..."
  exit 1
fi

IP=127.0.0.1
#IP=172.19.0.2 In dem Test

ID0=100
ID1=200

PORT0=2000
PORT1=2001

MOCKID=150
MOCKPORT=1400

tmux new -s peers -d
tmux send-keys -t peers "./build/peer $IP $PORT0 $ID0" C-m
tmux split-window -h -t peers
tmux send-keys "./build/peer $IP $PORT1 $ID1 $IP $PORT0" C-m
tmux split-window -h -t peers


tmux send-keys "./build/peer $IP $MOCKPORT $MOCKID $IP $PORT0" C-m
tmux split-window -h -t peers


tmux select-layout tiled
tmux attach -t peers