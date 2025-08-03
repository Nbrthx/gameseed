import { Scene } from "phaser";
import { Socket } from "socket.io-client";
import { Game } from "./Game";
import { SkillUI } from "../prefabs/ui/SkillUI";
import { AlertBoxUI } from "../prefabs/ui/AlertBoxUI";
import { BooksUI } from "../prefabs/ui/BooksUI";
import { Player } from "../prefabs/Player";
import { QuestUI } from "../prefabs/ui/QuestUI";
import { OutfitUI } from "../prefabs/ui/OutfitUI";
import { Chat } from "../prefabs/ui/Chat";

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export class GameUI extends Scene{

    socket: Socket
    keyboardInput: {
        up?: boolean
        down?: boolean
        left?: boolean
        right?: boolean
    }

    gameScene: Game
    debugText: Phaser.GameObjects.Text

    skillUI: SkillUI
    questUI: QuestUI
    alertBox: AlertBoxUI;
    bookButton: Phaser.GameObjects.Image;
    booksUI: BooksUI;
    outfitUI: OutfitUI;
    instructionText: Phaser.GameObjects.Text;
    outfitButton: Phaser.GameObjects.Image;
    chatbox: Phaser.GameObjects.Rectangle;
    chatTexts: any;
    chatNames: any;
    chat: Chat;

    constructor(){
        super('GameUI')
    }

    create(){
        this.gameScene = this.scene.get('Game') as Game
        
        this.socket = this.registry.get('socket')

        this.keyboardInput = {}

        this.alertBox = new AlertBoxUI(this, this.scale.width/2, this.scale.height/2)
        this.alertBox.setDepth(100)
        this.alertBox.setVisible(false)

        this.debugText = this.add.text(this.scale.width-80, 200, '', {
            fontFamily: 'PixelFont', fontSize: 24, align: 'right',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(1, 0.5)

        this.add.rectangle(50, 20, 500, 192, 0x223344, 0.5).setOrigin(0)
        this.instructionText = this.add.text(80, 40, 'No instructions yet', {
            fontFamily: 'PixelFont', fontSize: 24,
            color: '#fff'
        }).setOrigin(0).setWordWrapWidth(440)

        this.chatbox = this.add.rectangle(this.scale.width/2, 100, 700, 300, 0x442233, 0.5).setOrigin(0.5, 0)
        this.chatbox.setVisible(false)

        this.chatTexts = this.add.text(this.scale.width/2-300, 120, '', {
            fontFamily: 'PixelFont', fontSize: 24, lineSpacing: 2,
            color: '#fff'
        }).setOrigin(0).setWordWrapWidth(440, true).setMask(this.chatbox.createGeometryMask())
        this.chatNames = this.add.text(this.scale.width/2-300-2, 120-2, '', {
            fontFamily: 'PixelFont', fontSize: 24, fontStyle: 'bold',
            color: '#fff', stroke: '#469', strokeThickness: 2, letterSpacing: -0.5
        }).setOrigin(0).setWordWrapWidth(440, true).setMask(this.chatbox.createGeometryMask())

        this.chatbox.setInteractive()
        this.chatbox.on('wheel', (pointer: Phaser.Input.Pointer, _deltaX: number, deltaY: number) => {
            pointer.event.preventDefault()

            this.chatTexts.y -= deltaY*0.1
            this.chatNames.y -= deltaY*0.1
            if(this.chatTexts.y > 120){
                this.chatTexts.y = 120
                this.chatNames.y = 120-2
            }
            else if(this.chatTexts.y < -this.chatTexts.height+400){
                this.chatTexts.y = this.chatTexts.height > 300 ? -this.chatTexts.height+400 : 120
                this.chatNames.y = this.chatTexts.y-2
            }
        })
        this.chatbox.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if(!pointer.isDown) return
            pointer.event.preventDefault()

            this.chatTexts.y += pointer.y - pointer.prevPosition.y
            this.chatNames.y += pointer.y - pointer.prevPosition.y
            if(this.chatTexts.y > 120){
                this.chatTexts.y = 120
                this.chatNames.y = 120-2
            }
            else if(this.chatTexts.y < -this.chatTexts.height+400){
                this.chatTexts.y = this.chatTexts.height > 300 ? -this.chatTexts.height+400 : 120
                this.chatNames.y = this.chatTexts.y-2
            }
        })

        setInterval(() => {
            const then = Date.now()
            this.socket.emit('ping', () => {
                const fps = Math.floor(this.game.loop.actualFps*100)/100
                const now = Date.now()
                this.debugText.setText('Ping: '+ (now-then)+'ms\nFPS: '+fps)
            })
        }, 1000)

        const bottomBox = this.add.rectangle(this.scale.width/2, this.scale.height, this.scale.width, 80, 0x111111, 0.5)
        bottomBox.setOrigin(0.5, 1)

        const debugToggle = this.add.image(this.scale.width - 100, 50, 'ui-debug').setScale(4)
        debugToggle.setInteractive()
        debugToggle.on('pointerup', () => {
            this.gameScene.isDebug = !this.gameScene.isDebug
            this.gameScene.debugGraphics.clear()
        })

        const fullscreenToggle = this.add.image(this.scale.width - 200, 50, 'ui-fullscreen').setScale(4)
        fullscreenToggle.setInteractive()
        fullscreenToggle.on('pointerdown', () => {
            if (this.scale.isFullscreen){
                this.scale.stopFullscreen();
            }
            else{
                this.scale.startFullscreen();
            }
        })

        const chatToggle = this.add.image(this.scale.width - 300, 50, 'ui-chat').setScale(4)
        chatToggle.setInteractive()
        chatToggle.on('pointerup', () => {
            if (!this.chat.visible){
                this.chat.setVisible(true)
            }
            else{
                this.chat.setVisible(false)
            }
        })

        this.bookButton = this.add.image(this.scale.width-200, this.scale.height - 80, 'ui-book-button')
        this.bookButton.setScale(4).setInteractive()
        this.bookButton.on('pointerdown', () => {
            this.booksUI.setVisible(!this.booksUI.visible)
        })

        this.outfitButton = this.add.image(this.scale.width-400, this.scale.height - 80, 'ui-outfit-button')
        this.outfitButton.setScale(4).setInteractive()
        this.outfitButton.on('pointerdown', () => {
            this.outfitUI.setVisible(!this.booksUI.visible)
        })

        this.skillUI = new SkillUI(this)

        this.chat = new Chat(this, this.socket)
        this.chat.setVisible(false)

        this.handleGameEvent()
    }

    update(){
        this.keyboardInput = {
            up: this.input.keyboard?.addKey('W', false)?.isDown,
            down: this.input.keyboard?.addKey('S', false)?.isDown,
            left: this.input.keyboard?.addKey('A', false)?.isDown,
            right: this.input.keyboard?.addKey('D', false)?.isDown
        }

        if(this.skillUI.active) this.skillUI.update()
    }

    handleGameEvent(){
        this.gameScene.events.on('start', () => {
            this.gameScene = this.scene.get('Game') as Game
            this.scene.setVisible(true)

            this.chat = new Chat(this, this.socket)
            this.chat.setVisible(false)
        })
        this.gameScene.events.on('shutdown', () => {
            console.log('shutdown')
            this.scene.setVisible(false)
            this.booksUI.destroy(true)
            this.chat.destroy()
        })
    }

    setupUI(_player: Player){
        if(this.booksUI) this.booksUI.destroy(true)
        this.questUI = new QuestUI(this)
        this.questUI.setVisible(false)

        this.questUI.onOpen = (pos) => {
            const player = this.gameScene.player
            this.gameScene.camera.setFollowOffset(player.x - pos.x, player.y - pos.y - 40)
            this.tweens.add({
                targets: this.gameScene.camera,
                zoom: 1.6,
                duration: 400,
                ease: 'Linear'
            })
        }

        this.questUI.onClose = () => {
            this.gameScene.camera.setFollowOffset(0, 0)
            this.tweens.add({
                targets: this.gameScene.camera,
                zoom: 1,
                duration: 400,
                ease: 'Linear'
            })
        }

        this.booksUI = new BooksUI(this)
        this.booksUI.setVisible(false)

        this.outfitUI = new OutfitUI(this)
        this.outfitUI.setVisible(false)
    }
}