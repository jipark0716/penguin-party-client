import * as PIXI from 'pixi.js';
import {Board, BoardClickEvent} from './board';
import {CardClickEvent, Hand} from './hand'
import {CardRepository} from "./card";

const app = new PIXI.Application({
    background: '#1099bb',
    resizeTo: window,
})

// @ts-ignore
document.body.appendChild(app.view)

const cardRepository = new CardRepository(app)

const board = new Board(app, cardRepository)
app.stage.addChild(board.view)

const hand: Hand = new Hand(app, cardRepository)
app.stage.addChild(hand.view)

board.boardEvent.on('click', (event: BoardClickEvent) => {
    hand.removeCard(lastClickHand.index)
    board.submitCard(event.x, event.y, lastClickHand.card.type)
})

let lastClickHand: CardClickEvent
hand.cardEvent.on('click', (event: CardClickEvent) => {
    board.readySubmit(event.card.type)
    hand.selectCard(event.index)
    lastClickHand = event
})