import * as PIXI from "pixi.js";
import type {ColorSource} from "@pixi/core";

const cardSize :[number, number] = [35, 57]

export class CardRepository {
    cardTextures: PIXI.Texture[]
    app: PIXI.Application
    empty: PIXI.Texture
    submitAble: PIXI.Texture

    private createEmptyTexture(): PIXI.Texture
    {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xffffff)
        graphics.drawRoundedRect(0, 0, cardSize[0], cardSize[1], 5)
        return this.app.renderer.generateTexture(graphics.endFill())
    }

    private createSubmitAble(): PIXI.Texture
    {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xffffff)
        graphics.lineStyle(2, 0xffff00)
        graphics.drawRoundedRect(0, 0, cardSize[0], cardSize[1], 5)
        return this.app.renderer.generateTexture(graphics.endFill())
    }

    public getEmpty() {
        return this.empty
    }

    public getCard(type: number): PIXI.Texture {
        return this.cardTextures[type]
    }

    public constructor(app: PIXI.Application) {
        this.app = app
        this.submitAble = this.createSubmitAble()
        this.empty = this.createEmptyTexture()
        this.cardTextures = this.creatCardTexture()
    }

    private creatCardTexture(): PIXI.Texture[]
    {
        return Array.from({length: 5}).map((_, i) => PIXI.Texture.from(`assets/card${i + 1}.png`));
    }
}