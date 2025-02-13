#!/bin/bash

# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# export frontend
echo "Buildling Next.js frontend..."
cd ../client
npm install
npm run build

cd ../scripts

# spin up go server 
echo "Building Go server..."
go build -o ../go_binary ../server/api.go ../server/handlers.go ../server/utils.go ../server/nsevent.go
