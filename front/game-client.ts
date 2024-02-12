import * as PIXI from 'pixi.js';
import {Board} from './board';
import {Hand} from './hand'
import {CardRepository} from "./card";
import {PenguinParty} from "./penguin-party-sdk";
import {Lobby} from "./lobby";
import {Interface} from "./interface";

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
})

// @ts-ignore
document.body.appendChild(app.view)

const client = new PenguinParty({
    host: '20.214.207.225',
    port: 8000
})

const cardRepository = new CardRepository(app)
const board = new Board(app, cardRepository)
board.init(client)
new Hand(app, cardRepository).init(client, board)
new Lobby(app).init(client)
new Interface(app).init(client)