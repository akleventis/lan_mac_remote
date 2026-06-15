import { BrowserWindow, app, ApplicationMenu, Utils } from "electrobun/bun";
import { networkInterfaces } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

function checkPublicNetwork(ip: string): boolean {
  const ifaces = networkInterfaces();
  for (const iface of Object.values(ifaces)) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === "IPv4" && addr.address === ip) {
        return addr.cidr ? parseInt(addr.cidr.split("/")[1]) < 24 : false;
      }
    }
  }
  return false;
}

function getGoBinaryPath(): string {
  const macosPath = join(process.cwd(), "go_binary");
  return existsSync(macosPath) ? macosPath : join(process.cwd(), "../Resources/app/go_binary");
}

async function loadWindowHTML(serverURL: string, isPublicNetwork: boolean): Promise<string> {
  const htmlPath = join(process.cwd(), "../Resources/app/views/mainview/index.html");
  const template = await Bun.file(htmlPath).text();
  return template
    .replace("__SERVER_URL__", JSON.stringify(serverURL))
    .replace("__IS_PUBLIC_NETWORK__", JSON.stringify(isPublicNetwork));
}

let goServer: ReturnType<typeof Bun.spawn> | null = null;

function killGoServer() {
  if (goServer) {
    try { goServer.kill(); } catch {}
    goServer = null;
  }
}

process.on("exit", killGoServer);
process.on("SIGINT", () => { killGoServer(); process.exit(0); });
process.on("SIGTERM", () => { killGoServer(); process.exit(0); });

async function startGoServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    goServer = Bun.spawn([getGoBinaryPath()], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const timeoutId = setTimeout(() => {
      goServer?.kill();
      reject(new Error("Server startup timed out after 5 seconds"));
    }, 5000);

    let resolved = false;
    let buf = "";

    (async () => {
      try {
        for await (const chunk of goServer!.stdout) {
          buf += new TextDecoder().decode(chunk);
          const match = buf.match(/Server running on: (.+)/);
          if (match && !resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve("http://" + match[1].trim());
          }
        }
      } catch (err) {
        if (!resolved) { clearTimeout(timeoutId); reject(err); }
      }
    })();

    (async () => {
      for await (const chunk of goServer!.stderr) {
        process.stderr.write(new TextDecoder().decode(chunk));
      }
    })();

    goServer.exited.then((code) => {
      clearTimeout(timeoutId);
      if (!resolved) reject(new Error(`Server exited with code ${code}`));
    });
  });
}

ApplicationMenu.setApplicationMenu([
  {
    label: "Mac Remote",
    submenu: [
      { role: "hide", accelerator: "h" },
      { role: "hideOthers" },
      { role: "showAll" },
      { type: "separator" },
      { label: "Quit Mac Remote", role: "quit", accelerator: "q" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize", accelerator: "m" },
      { role: "close", accelerator: "w" },
    ],
  },
]);

ApplicationMenu.on("application-menu-clicked", (event: any) => {
  const action = event?.data?.action ?? event?.action;
  if (action === "quit") {
    killGoServer();
    Utils.quit();
  }
});

let windowHTML = "";

function openWindow() {
  new BrowserWindow({
    title: "Mac Remote",
    html: windowHTML,
    frame: { width: 400, height: 500, x: 100, y: 100 },
    styleMask: { Resizable: false },
  });
}

app.on("reopen", () => openWindow());
app.on("before-quit", () => killGoServer());

try {
  const serverURL = await startGoServer();
  const ip = serverURL.replace("http://", "").split(":")[0];
  const isPublicNetwork = checkPublicNetwork(ip);
  windowHTML = await loadWindowHTML(serverURL, isPublicNetwork);
  openWindow();
} catch (error) {
  console.error(`FATAL: ${error}`);
  process.exit(1);
}
