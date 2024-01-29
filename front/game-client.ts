import * as PIXI from 'pixi.js';
import {Board, BoardClickEvent} from './board';
import {CardClickEvent, Hand} from './hand'
import {CardRepository} from "./card";
import {PenguinParty} from "./penguin-party-sdk";

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
})

// @ts-ignore
document.body.appendChild(app.view)

const cardRepository = new CardRepository(app)

const board = new Board(app, cardRepository)
app.stage.addChild(board.view)

const client = new PenguinParty({
    host: '127.0.0.1',
    port: 8000
})

const hand: Hand = new Hand(app, cardRepository)
app.stage.addChild(hand.view)

board.boardEvent.on('click', (event: BoardClickEvent) => {
    hand.removeCard(lastClickHand.index)
    client.send('submitCard', {
        X: event.x,
        Y: event.y,
        CardIndex: lastClickHand.index
    })
})

let lastClickHand: CardClickEvent
hand.cardEvent.on('click', (event: CardClickEvent) => {
    board.readySubmit(event.card.type)
    hand.selectCard(event.index)
    lastClickHand = event
})

client.on('hello', (arg) => {
    client.send('authorize', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJ0eXBlIjoiZGlzY29yZCIsIm5iZiI6MTcwNTQwMzYwMywiZXhwIjoyMDA1NDAzOTAzfQ.44OA0CwceQq8ii3FDZ5APPZzGv9pbHuqyz0WjomTYyU')
})

client.on('authorize', () => {
    client.send('createRoom', {
        Name: '123',
    })
})

client.on('joinRoom', () => {
    client.send('gameStart')
})

client.on('gameStart', (event) => {
    event.Cards.forEach((o) => hand.addCard(o.Type))
})

client.on('submitCard', (event) => {
    board.submitCard(event.X, event.Y, lastClickHand.card.type)
})