import {PenguinParty} from "./penguin-party-sdk";
import * as PIXI from "pixi.js";
import * as User from './restful/user'
import {Graphics} from "pixi.js";

export class Interface {
    app: PIXI.Application
    container: PIXI.Container
    avatars: Avatar[]
    startButton: PIXI.Sprite
    public constructor(app: PIXI.Application) {
        this.app = app
        this.container = this.createContainer()
        this.avatars = [...this.createAvatars()]
        this.startButton = this.createStartButton()
        this.container.addChild(this.startButton, ...this.avatars.flatMap(o => o.container))
    }

    public init(sdk: PenguinParty) {
        this.app.stage.addChild(this.container)
        sdk.on('joinRoom', async (event) => {
            const ownerId = event.Room.Users.find(o => o.IsOwner)?.Id
            const userCollectResponse = await User.get(event.Room.Users.flatMap(o => o.Id))
            userCollectResponse.collect.forEach((user, i) => {
                const avatar = this.avatars[i]
                if (user.avatar) {
                    avatar.avatarImage = user.avatar
                }
                // 방장이면 왕관 달아주기
                avatar.isOwner = ownerId == user.id
                avatar.name = user.name
            })
        })

        this.startButton.addEventListener('click', () => {
            sdk.send('gameStart')
        })

        sdk.on('roundStart', () => this.startButton.visible = false)
    }

    private createStartButton(): PIXI.Sprite {
        const graphic = new PIXI.Graphics()
            .beginFill(0xcccccc)
            .lineStyle(1, 0x333333)
            .drawRoundedRect(0, 0, 100, 40, 16)
            .endFill()
        const result = new PIXI.Sprite(this.app.renderer.generateTexture(graphic));
        result.width = 150
        result.height = 60
        result.x = this.width / 2
        result.y = 200
        result.anchor.set(0.5)
        result.interactive = true;
        result.eventMode = 'static';

        const text = new PIXI.Text("start", {
            fontSize: 18
        })
        text.anchor.set(0.5)
        result.addChild(text)

        return result;
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
        result.width = this.width
        result.height = this.height
        result.x = 20
        result.y = 60
        return result
    }

    private createMaskTexture(): PIXI.Texture {
        const graphics = new PIXI.Graphics()
        graphics.lineStyle(0)
        graphics.beginFill(0xffffff, 1)
        graphics.drawCircle(30, 30, 30)
        return this.app.renderer.generateTexture(graphics.endFill())
    }

    private get width() {
        return this.app.screen.height - 40
    }

    private get height() {
        return this.app.screen.height - 60
    }
}

export class Avatar {
    alignLeft: boolean
    container: PIXI.Container
    nameArea: PIXI.Text
    scoreArea: PIXI.Text
    avatar: PIXI.Sprite
    crown: PIXI.Sprite
    public constructor(alignLeft: boolean, maskTexture: PIXI.Texture, textAreaTexture: PIXI.Texture) {
        const mask = new PIXI.Sprite(maskTexture)
        this.alignLeft = alignLeft
        this.container = this.createContainer()
        this.nameArea = this.createNameArea()
        this.scoreArea = this.createScoreArea()
        this.avatar = this.createAvatar(mask)
        this.crown = this.createCrown()
        const textArea = this.createTextArea(textAreaTexture)
        textArea.addChild(this.nameArea, this.scoreArea)
        this.container.addChild(textArea, mask, this.avatar, this.crown)
    }

    public init() {
        this.score = 0
        this.name = '비어있음'
        this.isOwner = false
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

    public set isOwner(isOwner: boolean) {
        this.crown.visible = isOwner
    }

    private createCrown(): PIXI.Sprite {
        const result = PIXI.Sprite.from('assets/crown.png')
        result.height = 25
        result.width = 25
        result.anchor.set(0.5);
        result.rotation = 5.5;
        return result
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