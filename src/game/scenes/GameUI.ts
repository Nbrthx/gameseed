import { Scene } from "phaser";
import { Socket } from "socket.io-client";
import { Game } from "./Game";
import { SkillUI } from "../prefabs/ui/SkillUI";
import { AlertBoxUI } from "../prefabs/ui/AlertBoxUI";

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

    constructor(){
        super('GameUI')
    }

    create(){
        this.socket = this.registry.get('socket')

        this.gameScene = this.scene.get('Game') as Game

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

        this.skillUI = new SkillUI(this)
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
}