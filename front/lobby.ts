import {PenguinParty} from "./penguin-party-sdk";
import * as PIXI from "pixi.js";

let activeScene: HTMLElement|null
const switchScene = (target: HTMLElement|null): void => {
    if (!target) return;
    activeScene?.classList.add('hidden')
    target.classList.remove('hidden')
    activeScene = target
}

const lobbyElement = document.getElementById('lobby')
const roomNameElement = <HTMLInputElement>document.getElementById('room-name')
const roomIdElement = <HTMLInputElement>document.getElementById('room-id')

document.getElementById('create')?.addEventListener('click', () => switchScene(document.getElementById("scene-2")))
document.getElementById('join')?.addEventListener('click', () => switchScene(document.getElementById("scene-3")))

export class Lobby {
    roomInfo: PIXI.Text
    public constructor(app: PIXI.Application) {
        this.roomInfo = this.createRoomInfo()
        app.stage.addChild(this.roomInfo)
    }

    public init(sdk: PenguinParty) {
        this.clear();

        // @ts-ignore
        document.getElementById('login')?.addEventListener('click', () => window.auth.start())
        document.getElementById('create-action')?.addEventListener('click', () => sdk.send('createRoom', {Name: roomNameElement.value}))
        document.getElementById('join-action')?.addEventListener('click', () => sdk.send('joinRoom', {Id: parseInt(roomIdElement.value)}))

        // @ts-ignore
        window.auth.done((token: string) => {
            sdk.send('authorize', token)
            switchScene(document.getElementById("scene-1"))
        })

        sdk.on('joinRoom', event => {
            this.set(`${event.Room.Name} (ID: ${event.Room.Id})`)
            lobbyElement?.classList.add('hidden')
            this.clear()
        })
    }

    public clear() {
        switchScene(document.getElementById("scene-0"))
        roomNameElement.value = ''
    }

    private set(title: string) {
        this.roomInfo.text = title
    }

    private createRoomInfo(): PIXI.Text {
        const result = new PIXI.Text('', {
            fontSize: 18
        })
        result.x = 20
        result.y = 5
        return result
    }
}