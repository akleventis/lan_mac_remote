const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  nativeImage,
  ipcMain,
} = require("electron");
const path = require("path");

let mainWindow;
let tray;
const serverURL = process.env.SERVER_URL;

if (!serverURL) {
  console.error("SERVER_URL is not set. Exiting...");
  process.exit(1);
}

function createMainWindow() {
  if (mainWindow) {
    mainWindow.show(); 
    mainWindow.focus()
    return;
  }

  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    title: "Mac Remote",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // focus attempts
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
  if (process.platform === 'darwin') {
    app.focus({ steal: true });
  }

  // hide the window when closed, keep app running in background
  mainWindow.on("close", (event) => {
    event.preventDefault(); 
    mainWindow.hide(); 
  });
}

// create tray menu
function createTray() {
  let icon = nativeImage.createFromPath(path.join(__dirname, "../icon.png"));
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show QR Code",
      click: () => {
        if (mainWindow) {
          mainWindow.show(); 
          mainWindow.focus()
        } else {
          createMainWindow(); 
        }
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("Mac Remote");
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createTray();
  createMainWindow(); 
  app.dock.hide(); 
});

// prevent app from quitting when all windows are closed
app.on("window-all-closed", (event) => {
  event.preventDefault(); 
});

// ensure the app fully quits when selecting "Quit" from the tray
app.on("before-quit", () => {
  if (mainWindow) {
    mainWindow.destroy();
  }
});

// Send the server URL to the renderer process
ipcMain.handle("get-server-url", () => serverURL);
