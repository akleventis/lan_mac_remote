# Local Area Network Remote for Macs <img width=40 src="assets/icon.png" style="vertical-align: text-bottom;" />
Application that allows your phone to trigger keypresses/OS events on a Mac over HTTP using TCP/IP

[Download Mac Remote v1.0.0](https://github.com/akleventis/lan_mac_remote/releases/tag/v1.0.0)
## Overview
<img align='right' width=170 src="assets/screen.png" />

[Go server](./server/api.go): Runs on the mac and handles triggering OS operations based on incoming http requests. Includes fileserver for Next.js static build

[React client](./client/): Static Next.js build served through go server. Runs on a device connected to the same network and acts as the user interface for sending commands.

[Electron](./electron/): Desktop application UI with a menu tray interface. Opens a window to display the QR code and server IP address.

### Available OS Actions
- play / pause
- prev / next track
- brightness up / down
- volume up / down
- arrow key left / right
- spacebar
- sleep

## Developer Setup
2. Clone repository `git clone https://github.com/akleventis/lan_mac_remote.git`

3. Ensure [go 1.23](https://go.dev/doc/install) is installed on system 

4. Install qrencode for ease of IP address landing page access via mobile device (dev only)
    - `brew install qrencode`

5. Install npm dependencies (dev only)
    -  `cd client ; npm install`

|command | description|
| :--: | :--: |
|[start_client.sh](./scripts/start_client.sh)| Starts the client app locally, making it accessible on the network |
|[start_server.sh](./scripts/start_server.sh)| Builds and runs the Go server |
|[start_app_dev.sh](./scripts/start_app_dev.sh)| Starts both the client and server for local development |
|[start_app_prod.sh](./scripts/start_app_prod.sh)| Builds the Next.js static export and starts the server for production |
|[build_app.sh](./scripts/build.sh)| Builds app for production |

> Note: You may need to update script permissions to make executable: `chmod +x scripts/`