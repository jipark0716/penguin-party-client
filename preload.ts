import * as electron from 'electron/renderer';
import * as net from "net";

electron.contextBridge.exposeInMainWorld('tcp', {
    connect: (option: net.NetConnectOpts) => electron.ipcRenderer.invoke('tcp:connect', option),
    send: (id: number, buffer: Uint8Array) => electron.ipcRenderer.invoke('tcp:send', id, buffer),
    onMessage: (id: number, callback: any) => {
        electron.ipcRenderer.on(
            `tcp:receive-${id}`,
            (_, buffer) => {
                callback(buffer)
            })}
})

electron.contextBridge.exposeInMainWorld('auth', {
    start: () => electron.ipcRenderer.invoke('auth:start'),
    id: () => electron.ipcRenderer.invoke('auth:id'),
    done: (callback: any) => {
        electron.ipcRenderer.on(
            'auth:done',
            (_, token) => {
                callback(token)
            })}
})