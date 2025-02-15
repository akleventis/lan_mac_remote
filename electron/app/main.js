const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  nativeImage,
  ipcMain,
} = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const env = process.env.NODE_ENV;
let serverURL;
let mainWindow;
let tray;
let goServer;
                                       
// helper to get go_binary path based on environment
function getGoBinaryPath() {
  if (env === "dev") {
    return path.join(__dirname, "..", "..", "go_binary");
  }
  return path.join(app.getAppPath(), "..", "go_binary");
}

// startGoServer launches the go_binary and returns a promise that resolves with serverURL or rejects after 5s timeout
async function startGoServer() {
  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 5000;
    const goBinaryPath = getGoBinaryPath();
    goServer = spawn(goBinaryPath);

    const timeoutId = setTimeout(() => {
      if (goServer) {
        goServer.kill();
      }
      reject(new Error('Server startup timed out after 5 seconds'));
    }, TIMEOUT_MS);

    goServer.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output.includes("Server running on: ")) {
        clearTimeout(timeoutId);
        serverURL = "http://" + output.split("Server running on: ")[1].trim();
        resolve(serverURL);
      }
    });

    goServer.stderr.on("data", (data) => {
      console.error("server log:", data.toString());
    });

    goServer.on("error", (err) => {
      clearTimeout(timeoutId); 
      console.error("failed to start server:", err);
      reject(err);
    });

    goServer.on("exit", (code) => {
      clearTimeout(timeoutId);
      if (!serverURL) {
        reject(new Error(`Server process exited with code ${code}`));
      }
    });
  });
}

function createMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
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
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });
  if (process.platform === "darwin") {
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
  let icon = nativeImage.createFromPath(path.join(__dirname, "icon.png"));
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show QR Code",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
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

// start go server and create main window
app.whenReady().then(async () => {
  try {
    await startGoServer();
    createTray();
    createMainWindow();
    app.dock.hide();
  } catch (error) {
    console.error("Failed to start Go server:", error);
    app.quit();
  }
});

// clicking dock icon or app icon
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow();
  }
  else if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// prevent app from quitting when all windows are closed
app.on("window-all-closed", (event) => {
  event.preventDefault();
});

// ensure the app fully quits when selecting "Quit" from the tray
app.on("before-quit", () => {
  if (mainWindow) {
    mainWindow.destroy();

    // stop go server
    if (goServer) {
      console.log("Stopping Go server...");
      try {
        const killed = goServer.kill();
        if (!killed) {
          process.kill(goServer.pid);
        }
      } catch (err) {
        console.error("Error stopping Go server:", err);
      }
    }
  }
});

// Send the server URL to the renderer process
ipcMain.handle("get-server-url", () => serverURL);
