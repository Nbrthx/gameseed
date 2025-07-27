import { Scene } from "phaser";
import { Socket } from "socket.io-client";

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

    debugText: Phaser.GameObjects.Text

    constructor(){
        super('GameUI')
    }

    create(){
        this.socket = this.registry.get('socket')

        this.keyboardInput = {}

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
    }

    update(){
        this.keyboardInput = {
            up: this.input.keyboard?.addKey('W', false)?.isDown,
            down: this.input.keyboard?.addKey('S', false)?.isDown,
            left: this.input.keyboard?.addKey('A', false)?.isDown,
            right: this.input.keyboard?.addKey('D', false)?.isDown
        }
    }
}