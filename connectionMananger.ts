import net from "net";
import {TypedEventEmitter} from "./event";
import electron from "electron";
import * as buffer from "buffer";

type TcpEvent = {
    'receive': [number, ArrayBuffer]
}

export class ConnectionManager {
    connections: net.Socket[] = []
    event: TypedEventEmitter<TcpEvent> = new TypedEventEmitter<TcpEvent>()
    public listen(window: electron.BrowserWindow) {
        electron.ipcMain.handle('tcp:connect', (event, option: net.NetConnectOpts) => {
            return this.addConnection(option)
        })
        electron.ipcMain.handle('tcp:send', (event, id: number, buffer: Uint8Array) => {
            this.send(id, buffer)
        })
        this.event.on('receive', (id, buffer) => {
            window.webContents.send(`tcp:receive-${id}`, buffer)
        })
    }

    public addConnection(option: net.NetConnectOpts): number
    {
        const connection = net.connect(option)
        const id = this.connections.push(connection) - 1
        connection.on('data', (buffer) => {
            this.event.emit(`receive`, id, buffer)
        })
        return id;
    }

    public send(id: number, packet: Uint8Array)
    {
        this.connections[id]?.write(packet)
    }
}