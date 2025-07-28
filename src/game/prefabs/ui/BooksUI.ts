import { GameUI } from "../../scenes/GameUI"
import { magicBookList } from "../MagicBook"


export class BooksUI extends Phaser.GameObjects.Container {

    scene: GameUI

    constructor(scene: GameUI) {
        super(scene, scene.scale.width-200, scene.scale.height/2)

        this.scene = scene
        scene.add.existing(this)

        const box = scene.add.rectangle(0, 0, 400, 600, 0xffffff, 0.8)
        box.setOrigin(1, 0.5)
        box.setInteractive()

        this.add(box)

        this.showBookList()
    }

    showBookList(){
        for(let i=0; i<magicBookList.length; i++){
            const text = this.scene.add.text(-360, -260+i*48, magicBookList[i].name, {
                fontFamily: 'PixelFont', fontSize: 32, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0, 0.5)
            text.setInteractive()
            text.on('pointerdown', () => {
                this.scene.socket.emit('changeBook', magicBookList[i].id)
                this.scene.gameScene.player.magicBook.changeBook(magicBookList[i].id)
                this.scene.skillUI.changeBorder(0)
                
                this.showBookList()
            })

            if(this.scene.gameScene.player.magicBook.id === magicBookList[i].id){
                text.setTint(0x00ff00)
            }

            this.add(text)
        }
    }
}