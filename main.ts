import electron from "electron";

electron.app.on("ready", () => {
  let window = new electron.BrowserWindow({
    width: 700,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadFile('./front/index.html');
  window.webContents.openDevTools()
});