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

# spin up dev server on all network interfaces -> enables accessibility from any device on the local network.
SERVER_IP=$LOCAL_IP npm --prefix ./client run dev -- -H 0.0.0.0 &
EXPO_PID=$!

QR_URL="http://$LOCAL_IP:3000"
echo "Lan Remote URL: $QR_URL"

# generate QR code
if command -v qrencode >/dev/null 2>&1; then
  qrencode -t UTF8 -m 0 "$QR_URL"
else
  echo "Warning: qrencode not installed. Install it to generate QR codes."
fi

# process information
echo "Expo process PID: $EXPO_PID"

# clean exit
trap "echo 'Stopping processes...'; kill -TERM $EXPO_PID; wait; exit" SIGINT SIGTERM

# wait for background processes to finish
wait