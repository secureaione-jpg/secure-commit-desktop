const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const APP_URL = process.env.SECUREAI_URL || "https://secureai.one/chat";
const INTERNAL_HOSTS = ["secureai.one", "www.secureai.one"];

let mainWindow = null;

function isInternal(url) {
  try { return INTERNAL_HOSTS.includes(new URL(url).hostname); } catch { return false; }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 860, minWidth: 480, minHeight: 600,
    title: "Secure AI",
    backgroundColor: "#0b0b0c",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false, spellcheck: true,
    },
  });
  mainWindow.loadURL(APP_URL);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) mainWindow.loadURL(url); else shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternal(url)) { event.preventDefault(); shell.openExternal(url); }
  });
  mainWindow.webContents.on("did-fail-load", (_e, code) => {
    if (code === -3) return;
    mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`
      <html><body style="font-family:-apple-system,sans-serif;background:#0b0b0c;color:#f5f5f7;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
        <div><h2 style="font-weight:600">Can't reach Secure AI</h2><p style="color:#8e8e93">Check your internet connection and try again.</p>
        <button onclick="location.href='${APP_URL}'" style="margin-top:16px;padding:10px 22px;border:0;border-radius:10px;background:#fff;color:#000;font-size:14px;font-weight:600;cursor:pointer">Retry</button></div>
      </body></html>`));
  });
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ role: "appMenu" }] : []),
    { role: "fileMenu" }, { role: "editMenu" },
    { label: "View", submenu: [
      { label: "Home", accelerator: "CmdOrCtrl+Shift+H", click: () => mainWindow?.loadURL(APP_URL) },
      { role: "reload" }, { role: "forceReload" }, { type: "separator" },
      { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { type: "separator" },
      { role: "togglefullscreen" },
    ]},
    { role: "windowMenu" },
  ]));
}

app.whenReady().then(() => {
  buildMenu(); createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
