#!/bin/bash

# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# spin up go server 
echo "Building Go server..."
go build -o ../go_binary ../server/api.go ../server/handlers.go ../server/utils.go ../server/nsevent.go

cd .. 
./go_binary dev &
GO_PID=$!

# process information
echo "Go process PID: $GO_PID"

# clean exit
trap "echo 'Stopping processes...'; kill -TERM $GO_PID; wait; exit" SIGINT SIGTERM

# wait for background processes to finish
wait 