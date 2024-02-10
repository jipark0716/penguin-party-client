import * as PIXI from "pixi.js"
import {TypedEventEmitter} from "../event";
import {CardRepository} from "./card";
import {PenguinParty} from "./penguin-party-sdk";

const BoardSize: number = 8

type BoardEvents = {
    'click': [BoardClickEvent]
}

export class BoardClickEvent {
    event: PIXI.FederatedPointerEvent
    x: number
    y: number
    public constructor(event: PIXI.FederatedPointerEvent, x: number, y: number) {
        this.event = event
        this.x = x
        this.y = y
    }
}

export class Cell {
    sprite: PIXI.Sprite
    cardType: number|null = null
    submittableCard: number[] | null = null
    public constructor(texture: PIXI.Texture) {
        this.sprite = PIXI.Sprite.from(texture)
        this.sprite.anchor.set(0.5)
        this.sprite.width = 35
        this.sprite.height = 57
    }
}

export class Board {
    container: PIXI.Container
    app: PIXI.Application
    background: PIXI.Sprite
    boardEvent: TypedEventEmitter<BoardEvents> = new TypedEventEmitter<BoardEvents>()
    cells: Cell[][]
    cardRepository: CardRepository
    cardCount = 0

    public constructor(app: PIXI.Application, cardRepository: CardRepository) {
        this.app = app
        this.cardRepository = cardRepository
        this.container = this.createContainer()
        this.background = this.createBackground()
        this.container.addChild(this.background)
        this.cells = this.createCells()
        this.cells.flat().forEach((o: Cell) => this.container.addChild(o.sprite))
    }

    public init(sdk: PenguinParty): void {
        this.app.stage.addChild(this.container)
        sdk.on('roundEnd', () => this.clear())
    }

    private createContainer(): PIXI.Container {
        const result = new PIXI.Container()
        result.x = (this.app.screen.width / 2) - 190
        result.y = (this.app.screen.height / 2) - 190
        result.width = 380
        result.height = 380
        return result
    }

    private createBackground()
    {
        const result = new PIXI.Sprite()
        result.width = 380
        result.height = 380
        result.eventMode = 'static'
        let lastX = 0;
        let lastY = 0;
        const drag = (e: PIXI.FederatedPointerEvent) => {
            // 드래그로 맵 이동
            // this.container.x -= lastX - e.x
            // this.container.y -= lastY - e.y
            lastX = e.x
            lastY = e.y
        }
        const remove = () => {
            this.container.eventMode = 'auto'
            this.container.removeEventListener('pointermove', drag)
        }
        result
            .on('pointerdown', (e) => {
                lastX = e.x;
                lastY = e.y;
                this.container.eventMode = 'static'
                this.container.addEventListener('pointermove', drag)
            })
            .on('pointerup', remove)
            .on('pointerupoutside', remove)
            .on('wheel', (e) => {
                // 보드 확대
                // this.container.scale.x -= e.deltaY * 0.01
                // this.container.scale.y -= e.deltaY * 0.01
            })
        return result;
    }

    private getXy(x: number, y: number): [number, number] {
        return [
            x * 50 + (y * 25),
            380 - (y * 65)
        ]
    }

    private createCells(): Cell[][]
    {
        return Array.from({length: BoardSize}, (_, y: number): Cell[]  => {
            return Array.from({length: BoardSize - y}, (_, x: number): Cell => {
                const cell = new Cell(this.cardRepository.getEmpty())
                cell.sprite.x = this.getXy(x, y)[0]
                cell.sprite.y = this.getXy(x, y)[1]
                cell.sprite.on('click', (event) => {
                    this.boardEvent.emit('click', new BoardClickEvent(event, x, y))
                })
                return cell;
            })
        })
    }

    public readySubmit(type: number): void
    {
        this.clearSubmittable()
        this.cells.forEach((row, y) => {
            row.forEach((o, x) => {
                if (
                    (this.cardCount == 0 && y == 0) ||
                    (o.cardType == null && o.submittableCard != null && (o.submittableCard.length == 0 || o.submittableCard.includes(type)))
                ) {
                    o.sprite.eventMode = 'static'
                    o.sprite.texture = this.cardRepository.getSubmitAble()
                }
            })
        })
    }

    public clear()
    {
        this.cells.flat().forEach((o) => {
            o.cardType = null
            o.submittableCard = null
        })
        this.cardCount = 0
        this.clearSubmittable()
    }

    private clearSubmittable()
    {
        this.cells.flat().forEach((o) => {
            o.sprite.eventMode = 'none'
            if (o.cardType == null) {
                o.sprite.texture = this.cardRepository.getEmpty()
            }
        })
    }

    public submitCard(x: number, y: number, type: number)
    {
        const cell = this.cells[y][x]
        cell.cardType = type
        this.clearSubmittable()
        this.cardCount++
        this.asyncSubmittable(x - 1, y)
        this.asyncSubmittable(x + 1, y)
        cell.sprite.texture = this.cardRepository.getCard(type)
    }

    public asyncSubmittable(x: number, y: number) {
        if (y > BoardSize || x > BoardSize - y || x < 0) return

        const cell = this.cells[y][x]
        if (!cell) return

        if (cell.cardType != null) {
            this.asyncSubmittable(x, y + 1)
            this.asyncSubmittable(x - 1, y + 1)
            return
        }

        if (y == 0) {
            cell.submittableCard = []
        } else {
            const lowLeftCard = this.cells[y - 1][x]?.cardType
            const lowRightCard = this.cells[y - 1][x + 1]?.cardType
            if (lowLeftCard !== null && lowRightCard !== null) {
                // 아래 카드 둘이 같으면 하나만
                cell.submittableCard = lowLeftCard == lowRightCard ?
                    [lowLeftCard] :
                    [lowLeftCard, lowRightCard]
            }
        }
    }
}
