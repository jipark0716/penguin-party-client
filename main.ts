import electron from 'electron';
import * as path from 'path';
import {ConnectionManager} from "./connectionMananger";
import * as auth from "./auth";
let window: electron.BrowserWindow

electron.app.setAsDefaultProtocolClient('jipark')

electron.app.on('ready', async () => {
    window = new electron.BrowserWindow({
        width: 700,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    window.loadFile('./front/index.html')
    // window.webContents.openDevTools()
    auth.init(window.webContents)

    new ConnectionManager().listen(window)
})