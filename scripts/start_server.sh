#!/bin/bash

# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# spin up go server
echo "Starting Go server..."
cd ../server
go run api.go handlers.go utils.go nsevent.go &
GO_PID=$!

# process information
echo "Go process PID: $GO_PID"

# clean exit
trap "echo 'Stopping processes...'; kill -TERM $GO_PID; wait; exit" SIGINT SIGTERM

# wait for background processes to finish
wait 