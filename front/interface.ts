import {PenguinParty} from "./penguin-party-sdk";
import * as PIXI from "pixi.js";
import * as User from './restful/user'

export class Interface {
    app: PIXI.Application
    container: PIXI.Container
    avatars: Avatar[]
    public constructor(app: PIXI.Application) {
        this.app = app
        this.container = this.createContainer()
        this.avatars = [...this.createAvatars()]
        this.container.addChild(...this.avatars.flatMap(o => o.container))
    }

    public init(sdk: PenguinParty) {
        this.app.stage.addChild(this.container)
        sdk.on('joinRoom', async (event) => {
            console.log(event)
            const userCollectResponse = await User.get(event.Room.Users)
            userCollectResponse.collect.forEach((user, i) => {
                const avatar = this.avatars[i]
                if (user.avatar) {
                    avatar.avatarImage = user.avatar
                }
                avatar.name = user.name
            })
        })
    }

    private *createAvatars(): Generator<Avatar> {
        const textAreaTexture = this.createTextAreaTexture();
        const mask = this.createMaskTexture()

        for (let i = 0; i < 3; i++) {
            // 왼쪽
            const left = new Avatar(true, mask, textAreaTexture)
            left.init()
            left.container.y = i * 120
            yield left

            // 오른쪽
            const right = new Avatar(false, mask, textAreaTexture)
            right.init()
            right.container.y = i * 120
            right.container.x = 500
            yield right
        }
    }

    private createTextAreaTexture(): PIXI.Texture {
        const graphics = new PIXI.Graphics
        graphics.beginFill(0x650A5A, 0.25);
        graphics.drawRoundedRect(0, 0, 120, 48, 4);
        graphics.endFill();
        return this.app.renderer.generateTexture(graphics)
    }

    private createContainer() {
        const result = new PIXI.Container()
        result.width = this.app.screen.width - 40
        result.height = this.app.screen.height - 20
        result.x = 20
        result.y = 20
        return result
    }

    private createMaskTexture(): PIXI.Texture {
        const graphics = new PIXI.Graphics()
        graphics.lineStyle(0)
        graphics.beginFill(0xffffff, 1)
        graphics.drawCircle(30, 30, 30)
        return this.app.renderer.generateTexture(graphics.endFill())
    }
}

export class Avatar {
    alignLeft: boolean
    container: PIXI.Container
    nameArea: PIXI.Text
    scoreArea: PIXI.Text
    avatar: PIXI.Sprite
    public constructor(alignLeft: boolean, maskTexture: PIXI.Texture, textAreaTexture: PIXI.Texture) {
        const mask = new PIXI.Sprite(maskTexture)
        this.alignLeft = alignLeft
        this.container = this.createContainer()
        this.nameArea = this.createNameArea()
        this.scoreArea = this.createScoreArea()
        this.avatar = this.createAvatar(mask)
        const textArea = this.createTextArea(textAreaTexture)
        textArea.addChild(this.nameArea, this.scoreArea)
        this.container.addChild(textArea, mask, this.avatar)
    }

    public init() {
        this.score = 0
        this.name = '비어있음'
    }

    public set score(score: number) {
        this.scoreArea.text = String(score)
        this.scoreArea.x = this.alignLeft ? 25 : 95 - this.scoreArea.width
    }

    public set avatarImage(url: string) {
        this.avatar.texture = PIXI.Texture.from(url)
    }

    public set name(name: string) {
        this.nameArea.text = String(name)
        this.nameArea.x = this.alignLeft ? 25 : 95 - this.nameArea.width
    }

    private createScoreArea(): PIXI.Text {
        const result = new PIXI.Text('', {
            fontSize: 12,
            fill: 0xffffff,
            align: this.alignLeft ? 'left' : 'right'
        })
        result.y = 25
        return result
    }

    private createAvatar(mask: PIXI.Sprite): PIXI.Sprite {
        const result = PIXI.Sprite.from('assets/empty-avatar.png')
        result.height = 60
        result.width = 60
        result.mask = mask
        mask.x = this.alignLeft ? 0 : 100
        result.x = this.alignLeft ? 0 : 100
        return result
    }

    private createContainer(): PIXI.Container {
        const result = new PIXI.Container()
        result.height = 100
        result.width = 160
        return result
    }

    private createNameArea(): PIXI.Text {
        const result = new PIXI.Text('비어있음', {
            fontSize: 12,
            fill: 0xffffff,
            align: this.alignLeft ? 'left' : 'right'
        })
        result.y = 5
        result.x = this.alignLeft ? 25 : 10
        return result
    }

    private createTextArea(texture: PIXI.Texture): PIXI.Container{
        const result = new PIXI.Sprite(texture)
        result.y = 10
        result.x = this.alignLeft ? 40 : 0
        return result
    }
}