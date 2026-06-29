const { app, BrowserWindow, shell, Menu, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// The single source of truth: the live Secure Commit page on the website.
// Change APP_URL only if the route ever moves. Everything users see comes
// from the live site, so deploying secureai.one updates every desktop app.
const APP_URL = process.env.SECURE_COMMIT_URL || "https://secureai.one/commit";

// Hosts we allow to load *inside* the app window. Anything else (docs,
// external links, OAuth providers, Stripe) opens in the user's real browser.
const INTERNAL_HOSTS = ["secureai.one", "www.secureai.one"];

let mainWindow = null;

function isInternal(targetUrl) {
  try {
    const { hostname } = new URL(targetUrl);
    return INTERNAL_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 480,
    minHeight: 600,
    title: "Secure Commit",
    backgroundColor: "#0b0b0c",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  // Links that try to open a new window/tab -> route by host.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) {
      mainWindow.loadURL(url);
    } else {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // In-page navigations to external hosts -> open in the real browser.
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isInternal(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Friendly error screen if the site can't be reached (e.g. offline).
  mainWindow.webContents.on("did-fail-load", (_e, errorCode, _desc, validatedURL) => {
    if (errorCode === -3) return; // aborted (normal during redirects)
    mainWindow.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
        <html><body style="font-family:-apple-system,sans-serif;background:#0b0b0c;color:#f5f5f7;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div>
            <h2 style="font-weight:600">Can't reach Secure Commit</h2>
            <p style="color:#8e8e93">Check your internet connection and try again.</p>
            <button onclick="location.href='${APP_URL}'" style="margin-top:16px;padding:10px 22px;border:0;border-radius:10px;background:#fff;color:#000;font-size:14px;font-weight:600;cursor:pointer">Retry</button>
          </div>
        </body></html>`)
    );
  });
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [{ role: "appMenu" }]
      : []),
    { role: "fileMenu" },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { label: "Home", accelerator: "CmdOrCtrl+Shift+H", click: () => mainWindow && mainWindow.loadURL(APP_URL) },
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  // Self-update the shell from GitHub Releases on launch.
  // No-ops in dev / unpackaged builds; downloads + installs on next quit.
  autoUpdater.checkForUpdatesAndNotify();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
