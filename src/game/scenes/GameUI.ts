import { Scene } from "phaser";
import { Socket } from "socket.io-client";
import { Game } from "./Game";
import { SkillUI } from "../prefabs/ui/SkillUI";
import { AlertBoxUI } from "../prefabs/ui/AlertBoxUI";
import { BooksUI } from "../prefabs/ui/BooksUI";
import { Player } from "../prefabs/Player";

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
    alertBox: AlertBoxUI;
    bookButton: Phaser.GameObjects.Image;
    booksUI: BooksUI;

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

        this.debugText = this.add.text(100, 100, '', {
            fontFamily: 'PixelFont', fontSize: 24,
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0)

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

        this.bookButton = this.add.image(this.scale.width-200, this.scale.height - 80, 'ui-book-button')
        this.bookButton.setScale(4).setInteractive()
        this.bookButton.on('pointerdown', () => {
            this.booksUI.setVisible(!this.booksUI.visible)
        })

        this.skillUI = new SkillUI(this)

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
        })
        this.gameScene.events.on('shutdown', () => {
            console.log('shutdown')
            this.scene.setVisible(false)
            this.booksUI.destroy(true)
        })
    }

    setupUI(_player: Player){
        if(this.booksUI) this.booksUI.destroy(true)

        this.booksUI = new BooksUI(this)
        this.booksUI.setVisible(false)
    }
}