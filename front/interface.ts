import {PenguinParty} from "./penguin-party-sdk";
import * as PIXI from "pixi.js";
import * as User from './restful/user'

export class Interface {
    app: PIXI.Application
    container: PIXI.Container
    avatars: Avatar[]
    startButton: PIXI.Sprite
    background: PIXI.Sprite
    result: PIXI.Sprite

    public constructor(app: PIXI.Application) {
        this.app = app
        this.container = this.createContainer()
        this.avatars = [...this.createAvatars()]
        this.startButton = this.createStartButton()
        this.background = this.createBackground()
        this.result = this.createResult()
        this.container.addChild(this.background, this.startButton, this.result, ...this.avatars.flatMap(o => o.container))
    }

    public set isOwner(isOwner: boolean) {
        this.startButton.visible = isOwner
    }

    public init(sdk: PenguinParty) {
        this.app.stage.addChild(this.container)
        sdk.on('joinRoom', async (event) => {
            const ownerId = event.Room.Users.find(o => o.IsOwner)?.Id
            const users = await User.get(event.Room.Users.map(o => o.Id))
            this.isOwner = ownerId == sdk.userId
            event.Room.Users
                .map(u => users.find(o => o.id == u.Id))
                .forEach(user => {
                    if (!user) return
                    this.addUser(user, ownerId == user.id, user.id == sdk.userId)
                })
        })

        sdk.on('joinRoomOther', async (event) => {
            if (event.Id == sdk.userId) return
            const users = await User.get([event.Id])
            this.addUser(users[0])
        })

        this.startButton.addEventListener('click', () => {
            sdk.send('gameStart')
        })

        sdk.on('roundStart', (event) => {
            this.startButton.visible = false
            this.background.visible = false
            this.avatars.forEach((o, i) => {
                if (o.user != null) {
                    o.card = event.Cards.length
                }
            })
        })

        sdk.on('submitCard', (event) => {
            const avatar = this.avatars.find(o => o.user?.id === event.UserId)
            if (!avatar) return
            avatar.card -= 1
        })

        sdk.on('turnStart', (event) => {
            const avatar = this.avatars.find(o => o.user?.id === event.Id)
            if (!avatar) return
            avatar.avatar.tint = 0xffff00
            // avatar.highlight.visible = event.Id == sdk.userId
        })

        sdk.on('roundEnd', event => {
            this.background.visible = true
            this.result.visible = true
            event.Players.forEach(player => {
                const avatar = this.avatars.find(avatar => avatar.user?.id == player.UserId)
                if (!avatar) return
                avatar.score = player.Score
            })
        })
    }

    private createResult(): PIXI.Sprite {
        return new PIXI.Sprite();
    }

    private addUser(user: User.User, isOwner: boolean = false, me: boolean = false) {
        const avatar = this.avatars.find(o => o.user == null)
        if (!avatar) return
        avatar.user = user

        if (user.avatar) {
            avatar.avatarImage = user.avatar
        }
        // 방장이면 왕관 달아주기
        avatar.isOwner = isOwner
        avatar.name = user.name

        // 본인 아바타 표시
        avatar.textArea.tint = me ? 0xff0000 : 0x999999
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

    public createBackground(): PIXI.Sprite {
        const result = new PIXI.Sprite(
            this.app.renderer.generateTexture(
                new PIXI.Graphics()
                    .beginFill(0xeeeeee)
                    .drawRoundedRect(0, 0,300, 300, 20)
                    .endFill()
            )
        )
        result.anchor.set(0.5)
        result.x = this.width / 2
        result.y = 200
        return result
    }

    private *createAvatars(): Generator<Avatar> {
        const textAreaTexture = this.createTextAreaTexture();
        const highlightTexture = this.createHighlightTexture();
        const mask = this.createMaskTexture()

        for (let i = 0; i < 3; i++) {
            // 왼쪽
            const left = new Avatar(true, mask, textAreaTexture, highlightTexture)
            left.init()
            left.container.y = i * 120
            yield left

            // 오른쪽
            const right = new Avatar(false, mask, textAreaTexture, highlightTexture)
            right.init()
            right.container.y = i * 120
            right.container.x = 500
            yield right
        }
    }

    private createHighlightTexture(): PIXI.Texture
    {
        return this.app.renderer.generateTexture(
            new PIXI.Graphics()
                .beginFill(0xffff00)
                .drawCircle(0, 0, 35)
                .endFill()
        )
    }

    private createTextAreaTexture(): PIXI.Texture {
        const graphics = new PIXI.Graphics
        graphics.beginFill(0xffffff, 0.25);
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
    cardCountArea: PIXI.Text
    cardCount: number = 0
    textArea: PIXI.Sprite
    user: User.User|null = null
    highlight: PIXI.Sprite
    public constructor(
        alignLeft: boolean,
        maskTexture: PIXI.Texture,
        textAreaTexture: PIXI.Texture,
        highlightTexture: PIXI.Texture
    ) {
        const mask = new PIXI.Sprite(maskTexture)
        this.alignLeft = alignLeft
        this.container = this.createContainer()
        this.nameArea = this.createNameArea()
        this.scoreArea = this.createScoreArea()
        this.avatar = this.createAvatar(mask)
        this.crown = this.createCrown()
        this.cardCountArea = this.createCardCount()
        const hand = this.createHand()
        this.textArea = this.createTextArea(textAreaTexture)
        this.highlight = this.createHighlight(highlightTexture)
        this.textArea.addChild(this.nameArea, this.scoreArea)
        this.container.addChild(this.textArea, mask, this.highlight, this.avatar, this.crown, hand, this.cardCountArea)
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

    public set card(count: number) {
        this.cardCount = count
        this.cardCountArea.text = `X${count}`
    }

    public get card(): number {
        return this.cardCount
    }

    private createHighlight(texture: PIXI.Texture): PIXI.Sprite {
        const result = new PIXI.Sprite(texture)
        result.visible = false
        result.anchor.set(0.5)
        result.y = 30
        result.x = this.alignLeft ? 32 : 128
        return result
    }

    private createCardCount(): PIXI.Text {
        const result = new PIXI.Text('X0', {
            fontSize: 18,
            fill: 0xffffff
        })
        result.anchor.set(0.5)
        result.x = this.alignLeft ? 144 : 16
        result.y = 34
        return result
    }

    private createHand(): PIXI.Sprite {
        const result = PIXI.Sprite.from('assets/cardback.png')
        result.height = 50
        result.width = 32
        result.x = this.alignLeft ? 128 : 0
        result.y = 10
        return result
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

    private createTextArea(texture: PIXI.Texture): PIXI.Sprite {
        const result = new PIXI.Sprite(texture)
        result.y = 10
        result.x = this.alignLeft ? 40 : 0
        return result
    }
}