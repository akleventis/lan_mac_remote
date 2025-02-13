const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getServerURL: () => ipcRenderer.invoke("get-server-url"),
});