# Local Area Network IOS Remote for Mac <img width=40 src="https://github.com/user-attachments/assets/b44303e5-06da-40d2-9a08-08285e3dc008" />
An app that lets your phone trigger keypresses or OS events on a connected Mac running these servers. Designed to eliminate the need to walk to your computer when it’s connected to a TV via an HDMI cable 

## Overview
<img align='right' width=200 src="https://github.com/user-attachments/assets/6dc2de9e-a2cc-49d8-a060-f5a08ad5faec" />

- python server runs on computer, allows access to os operations (mac)
- simple react client connected to same network (phone)
- network discovery through zeroconf
    - [server/zeroconfig.py](./server/zeroconfig.py): registers `lan_mac_remote_server` service which includes local ip address of current machine
    - [client/app/api/scan/route.ts](./client/app/api/scan/route.ts): searches for `lan_mac_remote_server` service on local network
- once service is found, we can send key press requests to the server from our phone through http over tcp/ip

Current keypress actions
- play/pause
- prev/next track
- brightness up/down
- volume up/down
- left/right arrow key press

## Mac OS Setup
1. Clone repository `git clone https://github.com/akleventis/lan_mac_remote.git`

1. We're going to be running 2 python servers on this device. 
    - [zeroconfig.py](./server/zeroconfig.py): broadcasts this device onto the local network 
    - [server.py](./client/app/api/scan/route.ts): listens for http events; triggerring operating system events accordingly 

1. Ensure `python3` is intalled on system 
   - `brew install python`: installs the latest Python 3 version
   - `python3 --version`: returns the python version (ex. `Python 3.9.6`)

1. Ensure `pyenv`is installed on system
   - `brew install pyenv`: installs the latest pyenv version
   - `pyenv --version`: returns pyenv version

1. Ensure virtualenv is installed
   - `pip3 install virtualenv`
   - `virtualenv --version`

1. Ensure pyenv-virtual is installed
   - `brew install pyenv-virtualenv`

1. Set up a virtual environment in /server using pyenv 
   - `pyenv virtualenv 3.9.6 lan_mac_remote`
     - replace `3.9.6` with current python version
     - creates virtual environment
   - `pyenv local lan_mac_remote`
     - ensures it's activated when working in project directory
   - verify VSCode inerpretter is set to lan_mac_remote_env

1. Enable keyboard accessibility
   1.	Open System Settings > Privacy & Security > Accessibility.
   1. Open finder and enable hidden files
      - Enter `Cmd + Shift + .` in the file selection dialog.
   1. Navigate to the global path of python virtual environment:
      - `~/.pyenv/versions/lan_mac_remote/bin/python`
   1.	Drag and drop to the list.

1. Install required packages located in [requirments.txt](./python/requirements.txt)
   - `pip install -r python/requirements.txt`

1. Install npm dependencies
   -  `npm install`
   

1. Download and configure [Hammerspoon](https://www.hammerspoon.org/)
> Oof antoher depedency?.. so sry... media controls proved to be quite tricky.

- Keypresses are triggered through Applescript, an apple scripting language that allows for control over some OS functions. For example, `brightness up` corresponds to a key code of `144`.
- Below, we are telling our System Events to trigger key 144, which will increment the brightness on your computer up a notch. 

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
  - Hammerspoon overcomes this limitation by directly sending system-level Play/Pause, Next, and Previous commands
  - It grants us the ability to trigger the play/pause system event through key bindings.

> Note: Once enabled, this will override the default functionality of F7, F8, and F9. You can disable Hammerspoon anytime to restore their original behavior.

- [download link](https://github.com/Hammerspoon/hammerspoon/releases/tag/1.0.0)
- After installation, open the app and follow steps allowing accessibility.
- click *Open Config* in the Hammerspoon menu. Copy this into the [init.lua](./init.lua)
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
> remaps the F8 key to trigger the universal Play/Pause media action

- click 'Reload Config' in the hammerspoon menu

12. `brew install qrencode`
- installs cli qr code generation
- used for ease of ip address landing page access via mobile device



## Run app
- Spin up Hammerspoon daemon

|command | description|
| :--: | :--: |
|`npm run dev`|run client-side app|
|`cd server ; python server.py`|runs server.py (keystroke api)|
|`cd server ; python zeroconfig.py`|runs zeroconfig.py (device registration)|
|`./start_app.sh`|script which spins up next & python servers|

> Note: You may need to update [start_app.sh](start_app.sh) permissions to make executable: `chmod +x start_app.sh`

### Bash alias for ease of running in any working dir 
- Add this line to your ~/.zshrc (or ~/.bashrc)
  - `alias lan_remote='./path/to/lan_mac_remote/start_app.sh';`
- Next & Python server will spin up with a single command `lan_remote`
- Scan the qr code or nav to recent project on IOS device for remote control
