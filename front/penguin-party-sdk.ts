import net from "net";
import {Packet, Tcp} from "./tcp";
import events from "events";

enum EventTypes {
    hello = 100,
    authorize = 101,
    joinRoom = 1001,
    roundStart = 3000,
    submitCard = 3001,
    roundEnd = 3002,
}

interface PenguinPartyEvents {
    hello: [Hello],
    authorize: [OnAuthorize],
    joinRoom: [OnJoinRoom],
    roundStart: [OnRoundStart],
    submitCard: [OnSubmitCard],
    roundEnd: [OnRoundEnd],
}

enum RequestTypes {
    authorize = 100,
    createRoom = 1000,
    joinRoom = 1001,
    gameStart = 3000,
    submitCard = 3001,
}

interface PenguinPartyRequest {
    authorize: [string],
    createRoom: [CreateRoomRequest],
    joinRoom: [JoinRoomRequest],
    gameStart: [],
    submitCard: [SubmitCardRequest],
}

export class PenguinParty {
    tcp: Tcp
    userId: number = 0
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
                console.log(`debug receive ${type} (${JSON.stringify(packet.payload)})`)
            } else {
                console.log(`핸들러 없음 ${packet.type} (${JSON.stringify(packet.payload)})`)
            }
        })
        this.on('authorize', (event) => this.userId = event.UserId)
        this.tcp.connect()
    }

    public send<T extends keyof PenguinPartyRequest>(
        actionName: T,
        ...argument: PenguinPartyRequest[T]
    ) {
        console.log(`debug send ${RequestTypes[actionName]} (${JSON.stringify(argument[0])})`)
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
interface OnRoundStart {
    Cards: Card[]
}
interface OnSubmitCard {
    X: number,
    Y: number,
    Card: Card,
    UserId: number
}
interface OnRoundEnd {
    Players: Player[]
}

interface OnJoinRoom {
    Room: Room
}

// req
interface CreateRoomRequest {
    Name: string
}
interface JoinRoomRequest {
    Id: number
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

interface Player {
    UserId: number
    Score: number
    Cards: Card[]
}

interface Room {
    Id: number
    Name: string
    Users: User[]
}

interface User {
    Id: number
    IsOwner: boolean
}