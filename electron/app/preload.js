const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getServerURL: () => ipcRenderer.invoke("get-server-url"),
  getIsPublicNetwork: () => ipcRenderer.invoke("get-is-public-network"),
});