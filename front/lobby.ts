import {PenguinParty} from "./penguin-party-sdk";

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
    sdk: PenguinParty
    public constructor(sdk: PenguinParty) {
        this.sdk = sdk
        // @ts-ignore
        window.auth.start()
        // @ts-ignore
        window.auth.done((token: string) => sdk.send('authorize', token))
    }

    public init() {
        this.clear();
        document.getElementById('create-action')?.addEventListener('click', () => this.sdk.send('createRoom', {Name: roomNameElement.value}))
        document.getElementById('join-action')?.addEventListener('click', () => this.sdk.send('joinRoom', {Id: parseInt(roomIdElement.value)}))

        this.sdk.on('joinRoom', () => {
            lobbyElement?.classList.add('hidden')
            this.clear()
        })
    }

    public clear() {
        switchScene(document.getElementById("scene-1"))
        roomNameElement.value = ''
    }
}