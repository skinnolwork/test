const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // webSecurity: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  // 🔷 여기서 등록
  globalShortcut.register('F5', () => {
    if (win) win.webContents.reload();
  });

  globalShortcut.register('CommandOrControl+R', () => {
    if (win) win.webContents.reload();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
