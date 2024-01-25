import * as PIXI from "pixi.js"

const BoardSize = 8
const cardSize :[number, number] = [35, 57]

export class Board {
    container: PIXI.Container
    cardTexture: PIXI.Texture
    app: PIXI.Application
    background: PIXI.Sprite

    public constructor(app: PIXI.Application) {
        this.app = app
        this.cardTexture = this.getCardGraphics()
        this.container = this.createContainer()
        this.background = this.createBackground()
        this.container.addChild(this.background)
        this.createCells().forEach((o: PIXI.Sprite) => this.container.addChild(o))
    }

    private createContainer(): PIXI.Container {
        const result = new PIXI.Container()
        result.x = (this.app.screen.width / 2) - 190
        result.y = (this.app.screen.height / 2) - 190
        result.width = 380
        result.height = 380
        return result;
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
            this.container.x -= lastX - e.x
            this.container.y -= lastY - e.y
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
                this.container.scale.x -= e.deltaY * 0.01
                this.container.scale.y -= e.deltaY * 0.01
            })
        return result;
    }

    private getCardGraphics(): PIXI.Texture
    {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xffffff)
        graphics.drawRoundedRect(0, 0, cardSize[0], cardSize[1], 5)
        return this.app.renderer.generateTexture(graphics.endFill())
    }

    private getXy(x: number, y: number): [number, number] {
        return [
            x * 50 + (y * 25),
            380 - (y * 65)
        ]
    }

    private createCells(): PIXI.Sprite[]
    {
        return Array.from({length: BoardSize}, (_, y: number): PIXI.Sprite[]  => {
            return Array.from({length: BoardSize - y}, (_, x: number): PIXI.Sprite => {
                const result = PIXI.Sprite.from(this.cardTexture);
                result.x = this.getXy(x, y)[0]
                result.y = this.getXy(x, y)[1]
                result.anchor.set(0.5)
                result.width = cardSize[0]
                result.height = cardSize[1]
                result.on('click', alert)
                    .on('pointerdown', alert)
                    .on('pointerup', alert)
                    .on('pointerupoutside', alert)
                return result;
            })
        }).flat()
    }

    get view() {
        return this.container
    }
}
