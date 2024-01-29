import net from "net";
import {TypedEventEmitter} from "../event";

export interface Packet {
    type: number
    payload: any
}

type TcpEvent = {
    'message': [Packet]
}

export class Tcp {
    id: number = -1
    config: net.NetConnectOpts
    event = new TypedEventEmitter<TcpEvent>()

    public constructor(config: net.NetConnectOpts) {
        this.config = config
    }

    public async connect() {
        // @ts-ignore
        this.id = await window.tcp.connect(this.config)
        // @ts-ignore
        window.tcp.onMessage(this.id, (buffer: Uint8Array) => this.onMessage(buffer))
    }

    public send(buffer: Uint8Array){
        // @ts-ignore
        window.tcp.send(this.id, buffer)
    }

    private onMessage(buffer: Uint8Array){
        for (const packet of this.decapsulation(buffer)) {
            this.event.emit('message', packet)
        }
    }

    private *decapsulation(buffer: Uint8Array): Generator<Packet> {
        while (buffer.byteLength >= 4) {
            let length = byteToUint16(buffer.slice(2, 4))
            // @ts-ignore
            let bodyString = String.fromCharCode.apply(null, buffer.slice(4, length + 4))
            yield {
                type: byteToUint16(buffer.slice(0, 2)),
                payload: JSON.parse(bodyString),
            }
            buffer = buffer.slice(length + 4)
        }
    }
}

const byteToUint16 = (input: Uint8Array) => {
    let a = new Uint16Array(1)
    let b = new Uint8Array(a.buffer)
    b[0] = input[0]
    b[1] = input[1]
    return a[0];
}