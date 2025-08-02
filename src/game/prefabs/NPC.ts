import { Game } from '../scenes/Game'

export interface NPCConfig {
    id: string
    name: string
    biography: string
    outfit: [boolean, number, string, string, string, string]
}

export const npcList: NPCConfig[] = [
    {
        "id": "npc1",
        "name": "Old Man",
        "biography": "A wise old man, known for his wisdom and wisdom. He is always ready to share his knowledge with those who seek it.",
        "outfit": [true, 0xffccaa, "short", "old", "red", "grey"]
    },
]

export class NPC extends Phaser.GameObjects.Container{

    id: string

    scene: Game
    sprite: Phaser.GameObjects.Sprite
    askButton: Phaser.GameObjects.Image
    nameText: Phaser.GameObjects.Text

    constructor(scene: Game, x: number, y: number, id: string){
        super(scene, x, y)

        this.scene = scene
        this.id = id

        scene.add.existing(this)

        this.sprite = scene.add.sprite(0, -36, 'male')
        this.sprite.setScale(scene.gameScale)
        this.sprite.setPipeline('Light2D')

        // const [isMale, color, hair, face, body, leg] = npcList.find(v => v.id == id)?.outfit || [false, 0xffffff, 'basic', 'basic', 'basic', 'basic']
        // this.sprite.setOutfit(isMale, color, hair, face, body, leg)
        this.sprite.play('idle')

        this.askButton = scene.add.image(0, -200, 'ask-button').setScale(scene.gameScale)
        this.askButton.setInteractive()

        scene.tweens.add({
            targets: this.askButton,
            scale: 3.8,
            y: this.askButton.y+4,
            alpha: 0.6,
            yoyo: true,
            repeat: -1,
            duration: 300
        })

        this.nameText = scene.add.text(0, -34*scene.gameScale, npcList.find(v => v.id == id)?.name || '', {
            fontFamily: 'PixelFont', fontSize: 24, letterSpacing: 2,
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setResolution(4)
        
        const shadow = scene.add.image(0, 19*scene.gameScale, 'shadow').setAlpha(0.4).setScale(scene.gameScale)

        this.setDepth(this.y/scene.gameScale)

        this.add([shadow, this.sprite, this.askButton, this.nameText])
    }

    update(){
        const isFlip = this.x - this.scene.player.x > 0
        this.sprite.setFlipX(isFlip)
        
        if(isFlip && this.askButton.x != -8) this.askButton.setX(-8)
        else if(!isFlip && this.askButton.x != 8) this.askButton.setX(8)
    }

    destroy() {
        super.destroy()
    }
}