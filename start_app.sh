#!/bin/bash

# get the script's directory
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# get the current local network IP address (macOS only)
get_local_ip() {
  ipconfig getifaddr en0 2>/dev/null
}

# start the first Python server
cd server
python server.py &
PYTHON1_PID=$!
cd ..

# start the second Python process
cd server
python zeroconfig.py &
PYTHON2_PID=$!
cd ..

# start client process
cd client
npm run dev -- -H 0.0.0.0 &
EXPO_PID=$!
cd ..

# get local network IP and generate a QR code
LOCAL_IP=$(get_local_ip)
QR_URL="http://$LOCAL_IP:3000"
echo "Access your server at: $QR_URL"
qrencode -t UTF8 "$QR_URL"

echo "Python server 1 PID: $PYTHON1_PID"
echo "Python server 2 PID: $PYTHON2_PID"
echo "Expo process PID: $EXPO_PID"

# Trap for clean exit
trap "echo 'Stopping processes...'; kill -TERM $PYTHON1_PID $PYTHON2_PID $EXPO_PID; exit" SIGINT SIGTERM

# Wait for background processes to finish
wait