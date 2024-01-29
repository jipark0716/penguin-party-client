import electron from 'electron';
import * as path from 'path';
import net from "net";
import {ConnectionManager} from "./connectionMananger";



electron.app.on('ready', () => {
    let window = new electron.BrowserWindow({
        width: 700,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    window.loadFile('./front/index.html')
    window.webContents.openDevTools()

    new ConnectionManager().listen(window)
})