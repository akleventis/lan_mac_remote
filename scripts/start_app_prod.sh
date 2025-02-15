#!/bin/bash

# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# helper for fetching local network IP address 
get_local_ip() {
  ipconfig getifaddr en0 2>/dev/null
}

# get local network IP and generate a QR code
LOCAL_IP=$(get_local_ip)
if [ -z "$LOCAL_IP" ]; then
  echo "Error: Unable to retrieve local IP address."
  exit 1
fi

# export frontend
echo "Buildling Next.js frontend..."
cd ../client
npm install
npm run build

cd ../scripts

# build go_binary executable
echo "Building Go server..."
go build -o ../go_binary ../server/api.go ../server/handlers.go ../server/utils.go ../server/nsevent.go

# run executable
cd ..
./go_binary prod &
GO_PID=$!

# process information
echo "Go process PID: $GO_PID"

# generate QR code
if command -v qrencode >/dev/null 2>&1; then
  qrencode -t UTF8 -m 0 "http://$LOCAL_IP:5001"
else
  echo "Warning: qrencode not installed. Install it to generate QR codes."
fi

# clean exit
trap "echo 'Stopping processes...'; kill -TERM $GO_PID; wait; exit" SIGINT SIGTERM

# wait for background processes to finish
wait 