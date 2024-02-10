import * as PIXI from 'pixi.js';
import {Board} from './board';
import {Hand} from './hand'
import {CardRepository} from "./card";
import {PenguinParty} from "./penguin-party-sdk";
import {Lobby} from "./lobby";

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
})

// @ts-ignore
document.body.appendChild(app.view)

const client = new PenguinParty({
    host: '127.0.0.1',
    port: 8000
})

const cardRepository = new CardRepository(app)
const board = new Board(app, cardRepository)
board.init(client)
const hand: Hand = new Hand(app, cardRepository)
hand.init(client, board)
new Lobby(client).init()

client.on('joinRoom', () => {
    client.send('gameStart')
})
