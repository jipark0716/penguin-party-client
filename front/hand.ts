import * as PIXI from "pixi.js";
import {CardRepository} from "./card";
import {TypedEventEmitter} from "../event";
import events from "events";

type CardEvents = {
    'click': [CardClickEvent]
}

export class CardClickEvent {
    event: PIXI.FederatedPointerEvent
    card: HandCard
    index: number
    public constructor(event: PIXI.FederatedPointerEvent, card: HandCard, index: number) {
        this.card = card
        this.event = event
        this.index = index

    }
}

export class HandCard {
    sprite: PIXI.Sprite
    type: number
    public constructor(sprite: PIXI.Sprite, type: number) {
        this.sprite = sprite
        this.type = type
    }
}

export class Hand {
    container: PIXI.Container
    app: PIXI.Application
    background: PIXI.Sprite
    cardRepository: CardRepository
    cards: HandCard[] = []
    cardEvent: TypedEventEmitter<CardEvents> = new TypedEventEmitter<CardEvents>()

    public constructor(app: PIXI.Application, cardRepository: CardRepository) {
        this.app = app
        this.cardRepository = cardRepository
        this.container = this.createContainer()
        this.background = this.createBackground()
        this.container.addChild(this.background)
        this.app.ticker.add(() => {
            this.cards.forEach((card, i: number) => {
                card.sprite.x = (this.container.width / 2) - (this.cards.length * 15) + (i * 30)
            })
        })
    }

    public addCard(type: number): void {
        const texture = this.cardRepository.getCard(type)
        if (texture == null) return;
        const card = new PIXI.Sprite(texture)
        card.anchor.set(0.5)
        card.width = 53
        card.height = 80
        card.y = 50;
        card.eventMode = 'static'
        let handCard = new HandCard(card, type)
        card.on('click', (event) => {
            this.cardEvent.emit('click', new CardClickEvent(event, handCard, this.cards.indexOf(handCard)))
        })
        this.container.addChild(card)
        this.cards.push(handCard)
    }

    private createBackground(): PIXI.Sprite {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xdddddd)
        graphics.drawRect(0, 0, 100, 100)
        const result = new PIXI.Sprite(this.app.renderer.generateTexture(graphics.endFill()));
        result.width = this.app.screen.width
        result.height = 100
        return result
    }

    private createContainer(): PIXI.Container
    {
        const result = new PIXI.Container()
        result.x = 0
        result.y = this.app.screen.height - 100
        result.width = this.app.screen.width
        result.height = 100
        return result
    }

    public removeCard(index: number): void
    {
        const card = this.cards.splice(index, 1)[0]
        this.container.removeChild(card.sprite)
        this.cards.forEach((o) => o.sprite.tint = 0xffffff)
    }

    public selectCard(index: number): void
    {
        this.cards.forEach((o, i) => {
            o.sprite.tint = i == index ? 0xffffff : 0xaaaaaa
        })
    }

    get view() {
        return this.container
    }
}