import { Scene } from "phaser";

export class GameUI extends Scene{

    keyboardInput: {
        up?: boolean
        down?: boolean
        left?: boolean
        right?: boolean
    }

    constructor(){
        super('GameUI')
    }

    create(){
        this.keyboardInput = {}
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