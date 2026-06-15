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

# embed Next.js export into Go server
echo "Embedding Next.js export into Go server..."
rm -rf ../server/static
cp -R ../client/out ../server/static

# build go_binary executable (static/ is now embedded)
echo "Building Go server..."
go build -o ../go_binary ../server/api.go ../server/handlers.go ../server/utils.go ../server/nsevent.go

echo
echo '...success'