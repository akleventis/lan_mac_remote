# Local Area Network Remote for Macs <img width=40 src="https://github.com/user-attachments/assets/b44303e5-06da-40d2-9a08-08285e3dc008" />
Application that allows your phone to trigger keypresses/OS events on a Mac over HTTP

## Overview
<img align='right' width=200 src="screen.PNG" />

[Go server](./server/api.go): Runs on the mac and handles triggering OS operations based on incoming http requests

[React client](./client/): Runs on a device connected to the same network and acts as the suer interface for sending comammnds.

Network discovery with Zeroconf
  - The server registers itself as a serviced named `lan_mac_remote_server` using Zeroconf via dns-sd
  - Registration:
    - `dns-sd -R "lan_mac_remote_server" _http._tcp local 8080`
  - This advertises the service along with the local IP address of the Mac on the network
  - The client uses Zeroconf to search for the service on the local network see [client/app/api/scan/route.ts](./client/app/api/scan/route.ts)
  - Once the service is discovered, the React client can send http requests to the server (via TCP/IP) from your phone to trigger keypresses or OS events on the mac

### Available OS Actions
- play/pause
- prev/next track
- brightness up/down
- volume up/down
- left/right arrow key press
- spacebar
- sleep


## Setup Instructions
1. Clone repository `git clone https://github.com/akleventis/lan_mac_remote.git`

1. Ensure [go 1.23](https://go.dev/doc/install) is installed on system 

1. Download and configure [Hammerspoon](https://www.hammerspoon.org/) (media controls proved to be quite tricky)
- See [this section](#hammerspoon) of readme for more info
- After installation, open the app and follow steps allowing accessibility
- click *Open Config* in the Hammerspoon menu and copy this into the [init.lua](./init.lua) file
```lua
-- Simulate Media Previous Track Key (F7)
hs.hotkey.bind({}, "F7", function()
    hs.eventtap.event.newSystemKeyEvent("PREVIOUS", true):post()
    hs.eventtap.event.newSystemKeyEvent("PREVIOUS", false):post()
end)

-- Simulate Media Play/Pause Key (F8)
hs.hotkey.bind({}, "F8", function()
    hs.eventtap.event.newSystemKeyEvent("PLAY", true):post()
    hs.eventtap.event.newSystemKeyEvent("PLAY", false):post()
end)

-- Simulate Media Next Track Key (F9)
hs.hotkey.bind({}, "F9", function()
    hs.eventtap.event.newSystemKeyEvent("NEXT", true):post()
    hs.eventtap.event.newSystemKeyEvent("NEXT", false):post()
end)
```
- click *Reload Config* in the Hammerspoon menu
> Note: Once enabled, this will override the default functionality of F7, F8, and F9. You can disable exit Hammerspoon anytime to restore their original behavior.

4. Install qrencode for ease of ip address landing page access via mobile device
    - `brew install qrencode`

5. Install npm dependencies
    -  `cd client ; npm install`

## Run app
1. Spin up Hammerspoon daemon

|command | description|
| :--: | :--: |
|`dns-sd -R "lan_mac_remote_server" _http._tcp local 8080`| broadcast service on the local network|
|`cd client ; npm run dev -- -H 0.0.0.0`|runs client-side app on all network interfaces (enables accessibility from any device on the local network) |
|`go build -o server_binary server/api.go server/handlers.go ./server_binary &`| builds & runs go server |
|`./start_app.sh`|script which spins up all services|

> Note: You may need to update [start_app.sh](start_app.sh) permissions to make executable: `chmod +x start_app.sh`

### Alias for ease of running in any working directory
- Add this line to your ~/.zshrc (or ~/.bashrc)
  - `alias lan_remote='./path/to/lan_mac_remote/start_app.sh';`
- Next & Go server will spin up with a single command `lan_remote`
- Scan the qr code to be redirected to IP address of remote

## Hammerspoon
Keypresses are triggered through Applescript, an apple scripting language that allows for control over some OS functions. For example, `brightness up` corresponds to a key code of `144`.

```bash
#!/bin/bash
osascript -e "tell application \"System Events\" to key code 144"
```

|Function key|Media key|
-|-
|F7|previous|
|F8|play/pause|
|F9|next|

These media controls are unique because they don’t use traditional key codes. For example, sending the key code for F8 (144) through AppleScript won’t trigger the play/pause action — it only simulates pressing the F8 key. This is because macOS handles media keys as system-level events, separate from standard key presses. 

Hammerspoon overcomes this limitation by directly sending system-level Play/Pause, Next, and Previous commands through key bindings.
