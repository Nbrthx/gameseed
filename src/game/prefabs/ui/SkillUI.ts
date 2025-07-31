import { GameUI } from "../../scenes/GameUI"
import { itemList } from "../ItemInstance"


export class SkillUI extends Phaser.GameObjects.Container{

    scene: GameUI
    activeIndex: number = 0

    border: Phaser.GameObjects.Image
    cooldownBoxs: Phaser.GameObjects.Sprite[] = []

    constructor(scene: GameUI){
        super(scene, scene.scale.width/2+196, scene.scale.height-16)

        this.scene = scene
        scene.add.existing(this)

        const bg = scene.add.image(0, 0, 'ui-skills')
        bg.setScale(4).setOrigin(1).setAlpha(0.8)

        this.border = scene.add.image(-264, -8, 'ui-selected-skill')
        this.border.setScale(4).setOrigin(1)

        scene.tweens.add({
            targets: this.border,
            alpha: 0.8,
            duration: 200,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        })

        this.eventHandler()
        
        this.add(bg)

        for(let i=0; i<3; i++){
            const cooldownBox = scene.add.sprite(-264+i*32*4, -8, 'cooldown-anim')
            cooldownBox.setScale(4).setAlpha(0.6).setOrigin(1)
            cooldownBox.setInteractive()
            cooldownBox.on('pointerdown', () => {
                this.activeIndex = i
                this.changeBorder(i)
            })

            this.cooldownBoxs.push(cooldownBox)
            this.add(cooldownBox)
        }

        this.add(this.border)

        for(let i=0; i<3; i++){
            const text = scene.add.text(-264+i*32*4, -12, `${i+1}`, {
                fontFamily: 'PixelFont', fontSize: 32, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(1)

            this.add(text)
        }
    }

    update(){
        for(let i=0; i<3; i++){
            const skill = this.scene.gameScene.player.magicBook.skills[i]

            const instanceData = itemList.find(v => v.id === skill.id) || itemList[0]

            const frameIndex = Math.floor(Math.max(Math.min((Date.now()-skill.timestamp)/instanceData.config.cooldown, 1), 0)*19)
            // console.log(item)
            this.cooldownBoxs[i].setFrame(frameIndex)
        }
        if(this.scene.gameScene.player.magicBook.activeIndex != this.activeIndex){
            this.activeIndex = this.scene.gameScene.player.magicBook.activeIndex
            this.border.setX(-264+this.activeIndex*32*4)
        }
    }

    eventHandler(){
        this.scene.input.off('wheel')
        this.scene.input.keyboard?.off('keydown')
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
            if(pointer.event.defaultPrevented) return

            if (deltaY > 0) {
                this.activeIndex = (this.activeIndex + 1) % 3;
            } else if (deltaY < 0) {
                this.activeIndex = (this.activeIndex - 1 + 3) % 3;
            }

            this.changeBorder(this.activeIndex)
        })
        this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            let index = this.activeIndex
            if (event.key === '1') {
                index = 0
            } else if (event.key === '2') {
                index = 1
            } else if (event.key === '3') {
                index = 2
            }

            if(index != this.activeIndex){
                this.activeIndex = index
                this.changeBorder(this.activeIndex)
            }
        })
    }

    changeBorder(index: number){
        this.border.setX(-264+index*32*4)

        this.scene.gameScene.player.equipItem(index)
        this.scene.socket.emit('changeSkill', index)
    }


}