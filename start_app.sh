#!/bin/bash

# broadcast service using dns-sd
dns-sd -R "lan_mac_remote_server" _http._tcp local 8080 &
DNS_SD_PID=$!

# 3 second delay for network registration
sleep 3

# get script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# get the local network IP address 
get_local_ip() {
  ipconfig getifaddr en0 2>/dev/null
}


# spin up go server 
go build -o server_binary server/api.go server/handlers.go
./server_binary &
GO_PID=$!

# spin up dev server on all network interfaces -> enables accessibility from any device on the local network.
npm --prefix ./client run dev -- -H 0.0.0.0 &
EXPO_PID=$!

# get local network IP and generate a QR code
LOCAL_IP=$(get_local_ip)
if [ -z "$LOCAL_IP" ]; then
  echo "Error: Unable to retrieve local IP address."
  kill -TERM $GO_PID $EXPO_PID $DNS_SD_PID
  exit 1
fi

QR_URL="http://$LOCAL_IP:3000"
echo "Lan Remote URL: $QR_URL"

# generate QR code
if command -v qrencode >/dev/null 2>&1; then
  qrencode -t UTF8 "$QR_URL"
else
  echo "Warning: qrencode not installed. Install it to generate QR codes."
fi

# process information
echo "Go process PID: $GO_PID"
echo "Expo process PID: $EXPO_PID"
echo "dns-sd process PID: $DNS_SD_PID"

# clean exit
trap "echo 'Stopping processes...'; kill -TERM $GO_PID $EXPO_PID $DNS_SD_PID; wait; exit" SIGINT SIGTERM

# wait for background processes to finish
wait