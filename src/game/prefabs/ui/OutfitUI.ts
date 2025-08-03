import { GameUI } from "../../scenes/GameUI"

const outfitsList = [
    {
        id: 'male',
        name: 'Miko',
    },
    {
        id: 'male1',
        name: 'Koko',
    },
    {
        id: 'female',
        name: 'Kelia',
    },
    {
        id: 'female1',
        name: 'Hina',
    }
]


export class OutfitUI extends Phaser.GameObjects.Container {

    scene: GameUI
    outfitList: Phaser.GameObjects.Text[]

    constructor(scene: GameUI) {
        super(scene, scene.scale.width-200, scene.scale.height/2)

        this.scene = scene
        scene.add.existing(this)

        this.outfitList = []

        const bg = scene.add.rectangle(-this.x, -this.y, scene.scale.width, scene.scale.height, 0x000000, 0.2)
        bg.setOrigin(0)
        bg.setInteractive()
        bg.on('pointerdown', () => {
            this.setVisible(false)
        })

        const box = scene.add.rectangle(0, 0, 400, 600, 0xffffff, 0.8)
        box.setOrigin(1, 0.5)
        box.setInteractive()

        this.add([bg, box])

        this.showOutfitList()
    }

    showOutfitList(){
        let x = 0
        for(let i=0; i<this.outfitList.length; i++){
            this.remove(this.outfitList[i])
            this.outfitList[i].destroy()
        }
        this.outfitList = []

        for(let i=0; i<outfitsList.length; i++){
            const text = this.scene.add.text(-360, -260+x*48, outfitsList[i].name, {
                fontFamily: 'PixelFont', fontSize: 32, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0, 0.5)
            
            text.setInteractive()
            text.on('pointerdown', () => {
                this.scene.socket.emit('changeOutfit', outfitsList[i].id)
                this.scene.gameScene.player.outfit = outfitsList[i].id
                
                this.showOutfitList()
            })

            if(this.scene.gameScene.player.outfit === outfitsList[i].id){
                text.setTint(0x00ff00)
            }

            this.outfitList.push(text)
            this.add(text)
            x++
        }
    }
}