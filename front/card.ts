import * as PIXI from "pixi.js";
import type {ColorSource} from "@pixi/core";

export class CardRepository {
    cardTextures: PIXI.Texture[]
    app: PIXI.Application

    public getCard(type: number): PIXI.Texture {
        return this.cardTextures[type]
    }

    public constructor(app: PIXI.Application) {
        this.app = app
        this.cardTextures = [
            this.creatCardTexture(0x00ffff),
            this.creatCardTexture(0x00ff00),
            this.creatCardTexture(0x0000ff),
            this.creatCardTexture(0xff0000),
            this.creatCardTexture(0xffff00),
        ]
    }

    private creatCardTexture(color: ColorSource): PIXI.Texture
    {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0x000000)
        graphics.lineStyle(2, 0x000000, 1)
        graphics.beginFill(color)
        graphics.drawRoundedRect(0, 0, 35, 57, 5)
        return this.app.renderer.generateTexture(graphics.endFill())
    }
}