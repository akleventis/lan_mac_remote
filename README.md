# Local Area Network Remote for Macs <img width=40 src="https://github.com/user-attachments/assets/b44303e5-06da-40d2-9a08-08285e3dc008" />
Application that allows your phone to trigger keypresses/OS events on a Mac over HTTP using TCP/IP

## Overview
<img align='right' width=170 src="screen.PNG" />

[Go server](./server/api.go): Runs on the mac and handles triggering OS operations based on incoming http requests

[React client](./client/): Runs on a device connected to the same network and acts as the user interface for sending commands.

[Build script](./start_app.sh): Retrieves the machine’s local IP address, injects it into the client via an environment variable, and launches both the client and server

### Available OS Actions
- play / pause
- prev / next track
- brightness up / down
- volume up / down
- arrow key left / right
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

4. Install qrencode for ease of IP address landing page access via mobile device
    - `brew install qrencode`

5. Install npm dependencies
    -  `cd client ; npm install`

## Run app
1. Spin up Hammerspoon daemon

|command | description|
| :--: | :--: |
|`./start_client.sh`| runs client-side app on all network interfaces (enables accessibility from any device on network) |
|`./start_client.sh`| builds & runs go server |
|`./start_app.sh`|script which spins up all services|

> Note: You may need to update script permissions to make executable: `chmod +x start_app.sh start_client.sh start_server.sh`

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
