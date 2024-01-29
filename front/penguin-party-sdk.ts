import net from "net";
import {Packet, Tcp} from "./tcp";
import events from "events";

enum EventTypes {
    hello = 100,
    authorize = 101,
    joinRoom = 1001,
    gameStart = 3000,
    submitCard = 3001,
}

interface PenguinPartyEvents {
    hello: [Hello],
    authorize: [OnAuthorize],
    joinRoom: [],
    gameStart: [OnGameStart],
    submitCard: [OnSubmitCard]
}

enum RequestTypes {
    authorize = 100,
    createRoom = 1000,
    gameStart = 3000,
    submitCard = 3001,
}

interface PenguinPartyRequest {
    authorize: [string],
    createRoom: [CreateRoomRequest],
    gameStart: [],
    submitCard: [SubmitCardRequest],
}

export class PenguinParty {
    tcp: Tcp
    private emitter = new events.EventEmitter()

    public on<T extends keyof PenguinPartyEvents & string>(
        eventName: T,
        handler: (...eventArg: PenguinPartyEvents[T]) => void
    ) {
        this.emitter.on(eventName, handler as any)
    }

    public constructor(config: net.NetConnectOpts) {
        this.tcp = new Tcp(config)
        this.tcp.event.on('message', (packet: Packet) => {
            const type = EventTypes[packet.type]
            if (type) {
                this.emitter.emit(type, packet.payload)
            } else {
                console.log(`핸들러 없음 ${packet.type} (${JSON.stringify(packet.payload)})`)
            }
            // console.log(`debug receive ${packet.type} (${JSON.stringify(packet.payload)})`)
        })
        this.tcp.connect()
    }

    public send<T extends keyof PenguinPartyRequest>(
        actionName: T,
        ...argument: PenguinPartyRequest[T]
    ) {
        // console.log(`debug send ${RequestTypes[actionName]} (${JSON.stringify(argument[0])})`)
        this.tcp.send(this.encapsulation(
            RequestTypes[actionName],
            argument[0],
        ))
    }

    private encapsulation(header: number, payload: any) {
        if (typeof(payload) == 'object') {
            payload = JSON.stringify(payload)
        }
        let bodyBuf = new TextEncoder().encode(payload);
        let typeBuf = this.uint16ToByte(header)
        let lengthBuf = this.uint16ToByte(bodyBuf.length)

        let buf = new ArrayBuffer(4 + bodyBuf.length)
        let bufView = new Uint8Array(buf)

        for (let i in typeBuf) {
            bufView[parseInt(i)] = typeBuf[i]
        }

        for (let i in lengthBuf) {
            bufView[parseInt(i)+2] = lengthBuf[i]
        }

        for (let i in bodyBuf) {
            bufView[parseInt(i)+4] = bodyBuf[i]
        }

        return new Uint8Array(buf)
    }

    private uint16ToByte(input: number) {
        let buf = new Uint16Array(1)
        buf[0] = input
        return new Uint8Array(buf.buffer)
    }
}

// res
interface Hello {
    id: number
}
interface OnAuthorize {
    UserId: number
}
interface OnGameStart {
    Cards: Card[]
}

// req
interface CreateRoomRequest {
    Name: string
}
interface SubmitCardRequest {
    X: number
    Y: number
    CardIndex: number
}

// etc
interface Card {
    Type: number
}

interface OnSubmitCard {
    X: number
    Y: number
    Card: Card
}